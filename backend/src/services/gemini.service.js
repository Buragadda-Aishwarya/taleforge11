import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const stripJsonFence = (value) =>
  value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const parseStructuredJson = (value) => {
  try {
    return JSON.parse(stripJsonFence(value));
  } catch (_error) {
    const error = new Error('Gemini returned invalid JSON.');
    error.statusCode = 502;
    throw error;
  }
};

const getGeminiModel = () => {
  if (!env.geminiApiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  return genAI.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
};

const getEmbeddingModel = () => {
  if (!env.geminiApiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  return genAI.getGenerativeModel({
    model: env.geminiEmbeddingModel,
  });
};

const callWithRetries = async (fn, { retries = 3, initialDelay = 500 } = {}) => {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const status = err?.status ?? err?.statusCode ?? null;

      // Retry on service-unavailable or rate-limit-like errors (503, 429)
      const shouldRetry = status === 503 || status === 429 || attempt <= retries;
      if (!shouldRetry || attempt > retries) {
        throw err;
      }

      console.warn(`Transient error from generative API (status=${status}). Retrying ${attempt}/${retries} after ${delay}ms`);
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

export const generateStoryBible = async (storyContent) => {
  if (typeof storyContent !== 'string' || storyContent.trim().length === 0) {
    const error = new Error('Story content is required.');
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
You are TaleForge AI's story bible extraction engine.

Extract a structured story bible from the story content below.

Return JSON only, with this exact shape:
{
  "characters": [
    {
      "name": "string",
      "description": "string",
      "role": "string",
      "relationships": ["string"]
    }
  ],
  "locations": [
    {
      "name": "string",
      "description": "string",
      "significance": "string"
    }
  ],
  "worldRules": [
    {
      "rule": "string",
      "category": "string",
      "evidence": "string"
    }
  ]
}

Use empty arrays when the story does not contain enough evidence for a section.
Do not invent facts that are not supported by the content.

Story content:
"""${storyContent.trim()}"""
`;

  const model = getGeminiModel();
  const result = await callWithRetries(() => model.generateContent(prompt), { retries: 4, initialDelay: 500 });
  const text = result.response.text();

  return parseStructuredJson(text);
};

export const generateEmbedding = async (text) => {
  if (typeof text !== 'string' || text.trim().length === 0) {
    const error = new Error('Text is required for embedding generation.');
    error.statusCode = 400;
    throw error;
  }

  const model = getEmbeddingModel();
  const result = await callWithRetries(() => model.embedContent(text.trim()), { retries: 3, initialDelay: 300 });

  return result.embedding.values;
};

export const generateEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    const error = new Error('Texts must be a non-empty array.');
    error.statusCode = 400;
    throw error;
  }

  return Promise.all(texts.map((text) => generateEmbedding(text)));
};
