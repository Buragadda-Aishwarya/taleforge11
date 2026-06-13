import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const normalizeMistralModel = (value) => {
  if (!value || value === 'mistral-7b-instruct') {
    return 'mistral-large-latest';
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
  chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  mistralApiKey: process.env.MISTRAL_API_KEY,
  mistralModel: normalizeMistralModel(process.env.MISTRAL_MODEL),
  sceneProvider: process.env.SCENE_PROVIDER || 'openai',
};

export const isProduction = env.nodeEnv === 'production';
