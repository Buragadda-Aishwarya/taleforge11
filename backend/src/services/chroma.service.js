import { ChromaClient } from 'chromadb';
import { env } from '../config/env.js';
import { generateEmbedding, generateEmbeddings } from './gemini.service.js';

const COLLECTION_NAME = 'stories';
const MEMORY_COLLECTION_NAME = 'story_memory';
const DEFAULT_RESULT_COUNT = 5;

const getChromaClientConfig = () => {
  const url = new URL(env.chromaUrl);

  return {
    host: url.hostname,
    port: Number.parseInt(url.port || (url.protocol === 'https:' ? '443' : '8000'), 10),
    ssl: url.protocol === 'https:',
  };
};

let chromaClient;
let storiesCollectionPromise;
let memoryCollectionPromise;

const getChromaClient = () => {
  if (!chromaClient) {
    chromaClient = new ChromaClient(getChromaClientConfig());
  }

  return chromaClient;
};

const getStoriesCollection = () => {
  if (!storiesCollectionPromise) {
    // Provide a custom embedding function that uses our Gemini embedding
    // to avoid requiring the DefaultEmbeddingFunction package on the server.
    storiesCollectionPromise = getChromaClient().getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: {
        service: 'taleforge-ai',
        entity: 'story_chunks',
      },
      embeddingFunction: {
        // The Chroma client expects a function that accepts an array of strings
        // and returns an array of embedding vectors. We implement that by
        // delegating to our existing `generateEmbeddings`/`generateEmbedding`.
        embedDocuments: async (texts) => {
          // `generateEmbeddings` expects an array and returns an array of embeddings
          return generateEmbeddings ? await generateEmbeddings(texts) : Promise.all(texts.map((t) => generateEmbedding(t)));
        },
        embedQuery: async (text) => {
          return generateEmbedding(text);
        },
      },
    }).catch((error) => {
      storiesCollectionPromise = null;
      throw error;
    });
  }

  return storiesCollectionPromise;
};

const getMemoryCollection = () => {
  if (!memoryCollectionPromise) {
    memoryCollectionPromise = getChromaClient().getOrCreateCollection({
      name: MEMORY_COLLECTION_NAME,
      metadata: {
        service: 'taleforge-ai',
        entity: 'story_memory',
      },
    }).catch((error) => {
      memoryCollectionPromise = null;
      throw error;
    });
  }

  return memoryCollectionPromise;
};

const normalizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
  );
};

const normalizeChunk = (chunk, index) => {
  if (typeof chunk === 'string') {
    return {
      content: chunk,
      chunkIndex: index,
      embedding: null,
      metadata: {},
    };
  }

  if (chunk && typeof chunk === 'object' && typeof chunk.content === 'string') {
    return {
      content: chunk.content,
      chunkIndex: Number.isInteger(chunk.chunkIndex) ? chunk.chunkIndex : index,
      embedding: Array.isArray(chunk.embedding) ? chunk.embedding : null,
      metadata: chunk.metadata && typeof chunk.metadata === 'object' ? chunk.metadata : {},
    };
  }

  const error = new Error('Chunks must be strings or objects with a string content field.');
  error.statusCode = 400;
  throw error;
};

const normalizeChunks = (chunks) =>
  chunks
    .map(normalizeChunk)
    .map((chunk) => ({
      ...chunk,
      content: chunk.content.trim(),
    }))
    .filter((chunk) => chunk.content.length > 0);

export const addStoryChunks = async (storyId, chunks) => {
  if (!storyId) {
    const error = new Error('Story ID is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    const error = new Error('Chunks must be a non-empty array.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedChunks = normalizeChunks(chunks);

  if (!normalizedChunks.length) {
    const error = new Error('Chunks must contain text content.');
    error.statusCode = 400;
    throw error;
  }

  const collection = await getStoriesCollection();
  const normalizedStoryId = String(storyId);

  const ids = normalizedChunks.map(
    (chunk) => `story:${normalizedStoryId}:chunk:${chunk.chunkIndex}`
  );

  await collection.add({
    ids,
    documents: normalizedChunks.map((chunk) => chunk.content),
    embeddings: normalizedChunks.every((chunk) => Array.isArray(chunk.embedding))
      ? normalizedChunks.map((chunk) => chunk.embedding)
      : undefined,
    metadatas: normalizedChunks.map((chunk) => ({
      storyId: normalizedStoryId,
      chunkIndex: chunk.chunkIndex,
      ...chunk.metadata,
    })),
  });

  return {
    collection: COLLECTION_NAME,
    storyId: normalizedStoryId,
    chunksAdded: normalizedChunks.length,
    ids,
  };
};

export const searchRelevantContext = async (query) => {
  if (typeof query !== 'string' || query.trim().length === 0) {
    const error = new Error('Search query is required.');
    error.statusCode = 400;
    throw error;
  }

  const collection = await getStoriesCollection();
  const queryEmbedding = await generateEmbedding(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: DEFAULT_RESULT_COUNT,
    include: ['documents', 'metadatas', 'distances'],
  });

  const ids = results.ids?.[0] || [];
  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return ids.map((id, index) => ({
    id,
    content: documents[index],
    metadata: metadatas[index] || {},
    distance: distances[index],
  }));
};

export const addMemory = async (id, text, metadata = {}) => {
  if (!id) {
    const error = new Error('Memory ID is required.');
    error.statusCode = 400;
    throw error;
  }

  if (typeof text !== 'string' || text.trim().length === 0) {
    const error = new Error('Memory text is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedId = String(id);
  const normalizedText = text.trim();
  const collection = await getMemoryCollection();
  const embedding = await generateEmbedding(normalizedText);

  await collection.add({
    ids: [normalizedId],
    documents: [normalizedText],
    embeddings: [embedding],
    metadatas: [normalizeMetadata(metadata)],
  });

  return {
    collection: MEMORY_COLLECTION_NAME,
    id: normalizedId,
    text: normalizedText,
    metadata: normalizeMetadata(metadata),
  };
};

export const searchMemory = async (query) => {
  if (typeof query !== 'string' || query.trim().length === 0) {
    const error = new Error('Memory search query is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedQuery = query.trim();
  const collection = await getMemoryCollection();
  const queryEmbedding = await generateEmbedding(normalizedQuery);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: DEFAULT_RESULT_COUNT,
    include: ['documents', 'metadatas', 'distances'],
  });

  const ids = results.ids?.[0] || [];
  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return ids.map((resultId, index) => ({
    id: resultId,
    text: documents[index],
    metadata: metadatas[index] || {},
    distance: distances[index],
  }));
};
