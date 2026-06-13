import { generatedPaths } from '@/data/sceneGenerationData';
import {
  expandScenePath as requestSceneExpansion,
  generateScenePaths as requestScenePaths,
  loadLatestStoryUpload,
} from './storyApi';

export const generateNarrativePaths = async (context) => {
  const provider = context.provider || 'openai';
  console.log(`[Neural Engine] Routing request via ${provider}...`);
  if (context.useChromaDbRetrieval) {
    console.log(`[Memory] Retrieving world state from ChromaDB...`);
  }

  const latestUpload = loadLatestStoryUpload();
  const storyId = latestUpload?.uploadResult?.story?.id;

  if (!storyId) {
    return generatedPaths.map((path) => ({
      ...path,
      isDemo: true,
    }));
  }

  const result = await requestScenePaths(storyId, provider);

  return (result.paths || []).map((path, index) => ({
    id: `path-${index + 1}`,
    title: path.title,
    tag: path.riskLevel === 'high' ? 'High Risk' : path.riskLevel === 'medium' ? 'Balanced' : 'Safe Path',
    summary: path.summary,
    impact: path.impact,
    characters: result.storyBible?.characters?.map((character) => character.name).filter(Boolean).slice(0, 3) || [],
    icon: index === 0 ? 'growth' : index === 1 ? 'conflict' : 'twist',
    narrativeScore: path.narrativeScore || Math.max(70, 95 - index * 4),
    provider: result.provider || provider,
    savedPathId: result.savedPaths?.[index]?.id,
    timelineImpact: index === 0 ? 'Minor Delay' : index === 1 ? 'Accelerated' : 'Major Divergence',
    riskLevel: path.riskLevel ? path.riskLevel.charAt(0).toUpperCase() + path.riskLevel.slice(1) : 'Medium',
  }));
};

export const generateFullScene = async (selectedPath, provider = 'openai') => {
  const latestUpload = loadLatestStoryUpload();
  const storyId = latestUpload?.uploadResult?.story?.id;

  if (!storyId) {
    throw new Error('Upload or load a story before expanding a scene.');
  }

  return requestSceneExpansion({
    storyId,
    selectedPath,
    provider,
  });
};
