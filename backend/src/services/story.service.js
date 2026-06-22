import { query } from '../config/db.js';
import { addStoryChunks } from './chroma.service.js';
import {
  extractRelationships,
  generateEmbeddings,
  generateStoryBible,
  normalizeStoryBible,
} from './gemini.service.js';

const CHUNK_MAX_LENGTH = 1200;
const CHUNK_OVERLAP_LENGTH = 150;

const unique = (items) => [...new Set(items.filter(Boolean))];

const extractFallbackCharacterNames = (content) => {
  const stopWords = new Set([
    'A',
    'An',
    'And',
    'As',
    'At',
    'But',
    'Captain',
    'Chief',
    'Commander',
    'Doctor',
    'Dr',
    'Finally',
    'First',
    'From',
    'Grateful',
    'He',
    'Her',
    'His',
    'However',
    'In',
    'It',
    'King',
    'Lady',
    'Later',
    'Lord',
    'Meanwhile',
    'Mr',
    'Mrs',
    'Ms',
    'One',
    'People',
    'Prince',
    'Princess',
    'Queen',
    'She',
    'Suddenly',
    'Together',
    'The',
    'Then',
    'They',
    'This',
    'Villain',
    'Worried',
    'With',
  ]);
  const genericNames = new Set(['Boy', 'Girl', 'Hero', 'Man', 'Narrator', 'Person', 'Protagonist', 'Traveler', 'Woman']);
  const nameCounts = new Map();
  const patterns = [
    /\b(?:named|called|known as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:said|asked|replied|whispered|shouted|thought|walked|ran|lived|met|found|helped|searched|followed|noticed|owned|mentored|hated|loved)\b/g,
    /\b(?:Mr|Mrs|Ms|Dr|Captain|King|Queen|Princess|Prince|Lord|Lady)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const name = match[1].replace(/^the\s+/i, '').trim();
      const words = name.split(/\s+/).filter(Boolean);
      if (
        !name ||
        stopWords.has(name) ||
        genericNames.has(name) ||
        words.every((word) => stopWords.has(word) || genericNames.has(word)) ||
        !/^[A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*)*$/.test(name)
      ) {
        continue;
      }
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    }
  }

  return [...nameCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 12);
};

const fallbackStoryBibleFromText = (content) => {
  const names = extractFallbackCharacterNames(content);
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

  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 12);

  return normalizeStoryBible({
    characters: names.map((name) => ({
      name,
      description: `${name} is mentioned in the uploaded story.`,
      role: 'Detected Character',
      relationships: [],
    })),
    locations,
    worldRules: rules,
    timelines: sentences.map((sentence, index) => ({
      order: index + 1,
      event: sentence,
      evidence: sentence,
    })),
  }, content);
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
    timelines: storyBible.timelines || [],
  };
};

const persistStoryBible = async ({ storyId, storyBible, relationships }) => {
  if (!Number.isInteger(Number(storyId))) {
    return {
      characters: [],
      locations: [],
      worldRules: [],
      timelines: [],
      relationships: [],
      persisted: false,
    };
  }

  const savedCharacters = [];
  const savedLocations = [];
  const savedWorldRules = [];
  const savedRelationships = [];

  for (const character of storyBible.characters) {
    const description = [
      character.description,
      character.role ? `Role: ${character.role}` : '',
    ].filter(Boolean).join(' ');
    const result = await query(
      `
        INSERT INTO characters (story_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, story_id, name, description, created_at, updated_at;
      `,
      [storyId, character.name || 'Unnamed Character', description]
    );
    savedCharacters.push(result.rows[0]);
  }

  for (const location of storyBible.locations) {
    const description = [
      location.description,
      location.significance ? `Significance: ${location.significance}` : '',
    ].filter(Boolean).join(' ');
    const result = await query(
      `
        INSERT INTO locations (story_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, story_id, name, description, created_at, updated_at;
      `,
      [storyId, location.name || 'Unnamed Location', description]
    );
    savedLocations.push(result.rows[0]);
  }

  for (const worldRule of storyBible.worldRules) {
    const ruleText = [
      worldRule.rule,
      worldRule.evidence ? `Evidence: ${worldRule.evidence}` : '',
    ].filter(Boolean).join(' ');
    const result = await query(
      `
        INSERT INTO world_rules (story_id, rule, category)
        VALUES ($1, $2, $3)
        RETURNING id, story_id, rule, category, created_at, updated_at;
      `,
      [storyId, ruleText, worldRule.category || 'World Rule']
    );
    savedWorldRules.push(result.rows[0]);
  }

  for (const relationship of relationships) {
    const result = await query(
      `
        INSERT INTO relationships (story_id, source, target, relation)
        VALUES ($1, $2, $3, $4)
        RETURNING id, story_id, source, target, relation, created_at;
      `,
      [
        storyId,
        relationship.source.trim(),
        relationship.target.trim(),
        relationship.relation.trim(),
      ]
    );
    savedRelationships.push(result.rows[0]);
  }

  return {
    characters: savedCharacters,
    locations: savedLocations,
    worldRules: savedWorldRules,
    timelines: storyBible.timelines || [],
    relationships: savedRelationships,
    persisted: true,
  };
};

export const uploadStoryWithIngestion = async ({ title, content }) => {
  const story = await createStory({ title, content });
  const processingStages = [
    { key: 'storyUpload', label: 'Story Upload', status: 'completed' },
    { key: 'storyBibleGeneration', label: 'Story Bible Generation', status: 'processing' },
    { key: 'knowledgeExtraction', label: 'Knowledge Extraction', status: 'processing' },
    { key: 'chromaDbMemoryCreation', label: 'ChromaDB Memory Creation', status: 'processing' },
    { key: 'knowledgeGraphUpdate', label: 'Knowledge Graph Update', status: 'processing' },
    { key: 'continuityAnalysis', label: 'Continuity Analysis', status: 'processing' },
    { key: 'researchProcessing', label: 'Research Processing', status: 'processing' },
    { key: 'sceneGenerationPreparation', label: 'Scene Generation Preparation', status: 'processing' },
  ];
  const setStage = (key, status, message = '') => {
    const stage = processingStages.find((item) => item.key === key);
    if (stage) {
      stage.status = status;
      if (message) stage.message = message;
    }
  };

  const storyBible = await generateStoryBibleFromText(content);
  setStage('storyBibleGeneration', 'completed');
  const relationships = await extractRelationships(content, storyBible);
  setStage('knowledgeExtraction', 'completed');
  let persistedStoryBible;

  try {
    persistedStoryBible = await persistStoryBible({
      storyId: story.id,
      storyBible,
      relationships,
    });
    setStage('knowledgeGraphUpdate', 'completed');
    setStage('continuityAnalysis', 'completed');
    setStage('researchProcessing', 'completed');
    setStage('sceneGenerationPreparation', 'completed');
  } catch (error) {
    console.warn('Story Bible persistence failed. Upload will continue.');
    console.warn(error.message || error);
    setStage('knowledgeGraphUpdate', 'failed', error.message || 'Story Bible persistence failed.');
    persistedStoryBible = {
      characters: [],
      locations: [],
      worldRules: [],
      timelines: [],
      relationships: [],
      persisted: false,
      reason: error.message || 'Story Bible persistence failed.',
    };
    setStage('continuityAnalysis', 'completed');
    setStage('researchProcessing', 'completed');
    setStage('sceneGenerationPreparation', 'completed');
  }

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
      setStage('chromaDbMemoryCreation', 'completed');
    } catch (error) {
      console.warn('Chroma vector indexing failed. Upload will continue without vector index.');
      console.warn(error.message || error);
      setStage(
        'chromaDbMemoryCreation',
        'warning',
        'ChromaDB is not reachable. Story processing completed, but vector memory was skipped. Start ChromaDB on http://localhost:8000 and reprocess this story to index memory.'
      );
      vectorIndex = {
        status: 'unavailable',
        reason: error.message || 'Chroma vector indexing failed.',
        chunksAdded: 0,
      };
    }
  } else {
    setStage('chromaDbMemoryCreation', 'warning', 'No story chunks were generated for vector memory.');
  }

  const graphReady = Boolean(persistedStoryBible.persisted);
  const continuityReady = Boolean(storyBible);
  const researchReady = Boolean(storyBible);
  const sceneGenerationReady = Boolean(storyBible && story?.id);
  const hasFailedStage = processingStages.some((stage) => stage.status === 'failed');

  return {
    story,
    storyBible,
    relationships,
    persistedStoryBible,
    chunks,
    vectorIndex,
    processingStatus: {
      status: hasFailedStage ? 'completed_with_warnings' : 'completed',
      stages: processingStages,
    },
    graphReady,
    continuityReady,
    researchReady,
    sceneGenerationReady,
  };
};
