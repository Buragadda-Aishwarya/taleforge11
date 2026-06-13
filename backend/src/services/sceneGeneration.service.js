import * as openaiService from './openai/sceneGeneration.service.js';
import * as mistralService from './mistral/sceneGeneration.service.js';
import { env } from '../config/env.js';

const providers = {
  openai: openaiService,
  mistral: mistralService,
};

const normalizeProvider = (provider) => {
  const normalized = String(provider || env.sceneProvider || 'openai').trim().toLowerCase();
  return providers[normalized] ? normalized : 'openai';
};

const resolveService = (provider) => {
  const normalized = normalizeProvider(provider);
  return {
    name: normalized,
    service: providers[normalized],
  };
};

export const generateScenePaths = async ({ provider, ...args }) => {
  const { name, service } = resolveService(provider);
  const result = await service.generateScenePaths(args);
  return { ...result, provider: name };
};

export const expandScenePath = async ({ provider, ...args }) => {
  const { name, service } = resolveService(provider);
  const result = await service.expandScenePath(args);
  return { ...result, provider: name };
};
