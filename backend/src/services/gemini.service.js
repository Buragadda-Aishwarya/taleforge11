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

export const normalizeStoryBible = (storyBible = {}, storyContent = '') => {
  const content = typeof storyContent === 'string' ? storyContent : '';
  const forbiddenCharacterNames = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'finally',
    'first',
    'from',
    'grateful',
    'he',
    'her',
    'his',
    'however',
    'i',
    'in',
    'it',
    'later',
    'meanwhile',
    'one',
    'people',
    'she',
    'suddenly',
    'together',
    'the',
    'then',
    'they',
    'this',
    'villain',
    'worried',
    'with',
  ]);
  const forbiddenLocationNames = new Set(['the', 'finally', 'then', 'one', 'a', 'an']);

  const isMentioned = (name) => {
    if (!content || !name) return true;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(content);
  };

  const cleanName = (value) =>
    String(value || '')
      .replace(/^the\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

  const dedupeByName = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = cleanName(item?.name).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const characters = dedupeByName(Array.isArray(storyBible.characters) ? storyBible.characters : [])
    .map((character) => ({
      name: cleanName(character.name),
      description: String(character.description || '').trim(),
      role: String(character.role || '').trim(),
      relationships: Array.isArray(character.relationships)
        ? character.relationships.filter((relationship) => typeof relationship === 'string' && relationship.trim())
        : [],
    }))
    .filter((character) => {
      const key = character.name.toLowerCase();
      return (
        character.name.length >= 2 &&
        !forbiddenCharacterNames.has(key) &&
        !/^\d+$/.test(character.name) &&
        isMentioned(character.name)
      );
    });

  const locations = dedupeByName(Array.isArray(storyBible.locations) ? storyBible.locations : [])
    .map((location) => ({
      name: cleanName(location.name),
      description: String(location.description || '').trim(),
      significance: String(location.significance || '').trim(),
    }))
    .filter((location) => {
      const key = location.name.toLowerCase();
      return location.name.length >= 2 && !forbiddenLocationNames.has(key) && isMentioned(location.name);
    });

  const seenRules = new Set();
  const worldRules = (Array.isArray(storyBible.worldRules) ? storyBible.worldRules : [])
    .map((worldRule) => ({
      rule: String(worldRule.rule || '').trim(),
      category: String(worldRule.category || 'World Rule').trim(),
      evidence: String(worldRule.evidence || '').trim(),
    }))
    .filter((worldRule) => {
      const key = worldRule.rule.toLowerCase();
      if (!worldRule.rule || seenRules.has(key)) return false;
      seenRules.add(key);
      return true;
    });

  const seenTimelineEvents = new Set();
  const timelines = (Array.isArray(storyBible.timelines) ? storyBible.timelines : [])
    .map((timeline, index) => ({
      order: Number.isFinite(Number(timeline.order)) ? Number(timeline.order) : index + 1,
      event: String(timeline.event || timeline.title || '').trim(),
      evidence: String(timeline.evidence || '').trim(),
    }))
    .filter((timeline) => {
      const key = timeline.event.toLowerCase();
      if (!timeline.event || seenTimelineEvents.has(key)) return false;
      seenTimelineEvents.add(key);
      return true;
    });

  return {
    characters,
    locations,
    worldRules,
    timelines,
  };
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

Important extraction rules:
- Characters must be real named people, creatures, organizations, or explicitly named groups from the story.
- Do not classify articles, transition words, sentence starters, or generic labels as characters.
- Exclude words like "The", "A", "Finally", "Then", "One", "Villain", "Hero", "King", "Queen", or "Princess" unless that exact word is clearly used as a proper name.
- Use the exact character names that appear in the story.
- Locations must be named or clearly described places from the story.
- Timeline events must be major story beats in chronological order.
- World rules must be durable facts or constraints, not ordinary one-time actions.

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
  ],
  "timelines": [
    {
      "order": 1,
      "event": "string",
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

  return normalizeStoryBible(parseStructuredJson(text), storyContent);
};

const fallbackRelationships = (storyContent) => {
  const patterns = [
    {
      regex: /\b([A-Z][a-z]+)\s+lives\s+in\s+(?:the\s+)?([A-Z][A-Za-z ]+?)(?=,|\.|!|\?|\s+and\s+|$)/g,
      relation: 'lives in',
    },
    {
      regex: /\b([A-Z][a-z]+)\s+mentors\s+([A-Z][a-z]+)(?=\s|,|\.|!|\?|$)/g,
      relation: 'mentors',
    },
    {
      regex: /\b((?:The\s+)?[A-Z][A-Za-z ]+?)\s+belongs\s+to\s+([A-Z][a-z]+)(?=\s|,|\.|!|\?|$)/g,
      relation: 'belongs to',
    },
    {
      regex: /\b([A-Z][a-z]+)\s+owns\s+([A-Z][A-Za-z ]+?)(?=[.!?]|$)/g,
      relation: 'owns',
    },
  ];
  const relationships = [];
  const seen = new Set();

  for (const { regex, relation } of patterns) {
    for (const match of storyContent.matchAll(regex)) {
      const source = match[1].trim().replace(/^The\s+/i, '');
      const target = match[2].trim().replace(/^the\s+/i, '');
      const key = `${source.toLowerCase()}:${relation}:${target.toLowerCase()}`;

      if (seen.has(key)) continue;
      seen.add(key);

      relationships.push({
        source,
        target,
        relation,
      });
    }
  }

  return relationships;
};

export const extractRelationships = async (storyContent, storyBible = {}) => {
  if (typeof storyContent !== 'string' || storyContent.trim().length === 0) {
    const error = new Error('Story content is required for relationship extraction.');
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
You are TaleForge AI's relationship extraction engine.

Extract explicit relationships from the story. Relationships may connect characters,
locations, artifacts, organizations, events, or world concepts.

Known Story Bible:
${JSON.stringify(storyBible, null, 2)}

Return JSON only with this exact shape:
{
  "relationships": [
    {
      "source": "string",
      "target": "string",
      "relation": "string"
    }
  ]
}

Examples:
- "Aria lives in Glass Kingdom" -> source: "Aria", target: "Glass Kingdom", relation: "lives in"
- "Kiran mentors Aria" -> source: "Kiran", target: "Aria", relation: "mentors"
- "Moon Fragment belongs to Aria" -> source: "Moon Fragment", target: "Aria", relation: "belongs to"

Only extract relationships supported by the story. Do not invent facts.

Story:
"""${storyContent.trim()}"""
`;

  try {
    const model = getGeminiModel();
    const result = await callWithRetries(
      () => model.generateContent(prompt),
      { retries: 2, initialDelay: 400 }
    );
    const parsed = parseStructuredJson(result.response.text());

    return Array.isArray(parsed.relationships)
      ? parsed.relationships.filter(
          (item) =>
            typeof item?.source === 'string' &&
            typeof item?.target === 'string' &&
            typeof item?.relation === 'string'
        )
      : [];
  } catch (error) {
    console.warn('Gemini relationship extraction failed. Using local relationship extraction.');
    console.warn(error.message || error);
    return fallbackRelationships(storyContent);
  }
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
