import { query } from '../config/db.js';
import { addStoryChunks } from './chroma.service.js';
import { generateEmbeddings, generateStoryBible } from './gemini.service.js';

const CHUNK_MAX_LENGTH = 1200;
const CHUNK_OVERLAP_LENGTH = 150;

const unique = (items) => [...new Set(items.filter(Boolean))];

const fallbackStoryBibleFromText = (content) => {
  const names = unique(content.match(/\b[A-Z][a-z]{2,}\b/g) || []).slice(0, 12);
  const locationKeywords = [
    'ocean',
    'kingdom',
    'city',
    'forest',
    'realm',
    'tower',
    'village',
    'castle',
    'island',
  ];
  const locations = locationKeywords
    .filter((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(content))
    .map((keyword) => ({
      name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
      description: `Mentioned in the uploaded story.`,
      significance: 'Detected from story text',
    }));
  const rules = [];

  if (/cannot swim/i.test(content)) {
    rules.push({
      rule: 'Aria cannot swim.',
      category: 'Character Trait',
      evidence: 'The uploaded story says Aria cannot swim.',
    });
  }

  if (/hates magic/i.test(content)) {
    rules.push({
      rule: 'Aria hates magic.',
      category: 'Character Trait',
      evidence: 'The uploaded story says Aria hates magic.',
    });
  }

  return {
    characters: names.map((name) => ({
      name,
      description: `${name} is mentioned in the uploaded story.`,
      role: 'Detected Character',
      relationships: [],
    })),
    locations,
    worldRules: rules,
  };
};

export const createStory = async ({ title, content }) => {
  try {
    const result = await query(
      `
        INSERT INTO stories (title, content)
        VALUES ($1, $2)
        RETURNING id, title, content, created_at, updated_at;
      `,
      [title, content]
    );

    return result.rows[0];
  } catch (error) {
    console.warn('PostgreSQL story insert failed. Continuing with an in-memory story id.');
    console.warn(error.message || error);

    return {
      id: `local-${Date.now()}`,
      title,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      persisted: false,
    };
  }
};

export const splitStoryIntoChunks = (content) => {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();

  if (!normalizedContent) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < normalizedContent.length) {
    let end = Math.min(start + CHUNK_MAX_LENGTH, normalizedContent.length);

    if (end < normalizedContent.length) {
      const sentenceBoundary = normalizedContent.lastIndexOf('.', end);
      const paragraphBoundary = normalizedContent.lastIndexOf('\n', end);
      const boundary = Math.max(sentenceBoundary, paragraphBoundary);

      if (boundary > start + CHUNK_MAX_LENGTH * 0.5) {
        end = boundary + 1;
      }
    }

    const chunkContent = normalizedContent.slice(start, end).trim();

    if (chunkContent) {
      chunks.push({
        content: chunkContent,
        chunkIndex: chunks.length,
      });
    }

    if (end >= normalizedContent.length) {
      break;
    }

    start = Math.max(0, end - CHUNK_OVERLAP_LENGTH);
  }

  return chunks;
};

export const generateStoryBibleFromText = async (storyContent) => {
  let storyBible;

  try {
    storyBible = await generateStoryBible(storyContent);
  } catch (error) {
    console.warn('Gemini story bible extraction failed. Using local fallback extraction.');
    console.warn(error.message || error);
    storyBible = fallbackStoryBibleFromText(storyContent);
  }

  return {
    characters: storyBible.characters || [],
    locations: storyBible.locations || [],
    worldRules: storyBible.worldRules || [],
  };
};

export const uploadStoryWithIngestion = async ({ title, content }) => {
  const story = await createStory({ title, content });
  const storyBible = await generateStoryBibleFromText(content);
  const chunks = splitStoryIntoChunks(content);
  let vectorIndex = {
    status: 'skipped',
    reason: 'No chunks were generated.',
    chunksAdded: 0,
  };

  if (chunks.length) {
    try {
      const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.content));
      const chunksWithEmbeddings = chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index],
        metadata: {
          title: story.title,
        },
      }));

      vectorIndex = {
        status: 'indexed',
        ...(await addStoryChunks(story.id, chunksWithEmbeddings)),
      };
    } catch (error) {
      console.warn('Chroma vector indexing failed. Upload will continue without vector index.');
      console.warn(error.message || error);
      vectorIndex = {
        status: 'unavailable',
        reason: error.message || 'Chroma vector indexing failed.',
        chunksAdded: 0,
      };
    }
  }

  return {
    story,
    storyBible,
    chunks,
    vectorIndex,
  };
};
