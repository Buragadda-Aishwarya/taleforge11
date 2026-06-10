import { generatedPaths } from '@/data/sceneGenerationData';
import {
  generateScenePaths as requestScenePaths,
  loadLatestStoryUpload,
} from './storyApi';

/**
 * Service to handle Narrative Path generation.
 * Currently returns mock data from sceneGenerationData.
 * 
 * FUTURE INTEGRATION:
 * 1. Replace the timeout with actual fetch/axios calls to your backend API route.
 * 2. Pass the 'GenerationContext' to the backend to route to the appropriate model
 *    (e.g., GPT-4 parsing via LangChain, or direct Gemini API routing).
 * 3. Use ChromaDB on the backend to retrieve context before generating the prompt.
 */
export const generateNarrativePaths = async (context) => {
  console.log(`[Neural Engine] Routing request via ${context.provider}...`);
  if (context.useChromaDbRetrieval) {
    console.log(`[Memory] Retrieving world state from ChromaDB...`);
  }

  const latestUpload = loadLatestStoryUpload();
  const storyId = latestUpload?.uploadResult?.story?.id;

  if (!storyId) {
    return generatedPaths;
  }

  try {
    const result = await requestScenePaths(storyId);

    return (result.paths || []).map((path, index) => ({
      id: `path-${index + 1}`,
      title: path.title,
      tag: path.riskLevel === 'high' ? 'High Risk' : path.riskLevel === 'medium' ? 'Balanced' : 'Safe Path',
      summary: path.summary,
      impact: path.impact,
      characters: result.storyBible?.characters?.map((character) => character.name).filter(Boolean).slice(0, 3) || [],
      icon: index === 0 ? 'growth' : index === 1 ? 'conflict' : 'twist',
      narrativeScore: Math.max(70, 95 - index * 4),
      timelineImpact: index === 0 ? 'Minor Delay' : index === 1 ? 'Accelerated' : 'Major Divergence',
      riskLevel: path.riskLevel ? path.riskLevel.charAt(0).toUpperCase() + path.riskLevel.slice(1) : 'Medium',
    }));
  } catch (error) {
    console.error('Backend scene generation failed. Falling back to local paths.', error);
    return generatedPaths;
  }
};
