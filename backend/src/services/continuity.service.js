import { searchRelevantContext } from './chroma.service.js';
import { runContinuityAgent } from './continuityAgent.js';

const fallbackFacts = [
  'Aria cannot swim.',
  'Aria hates magic.',
];

const getFallbackContext = (facts = fallbackFacts) =>
  facts.map((fact, index) => ({
    id: `fallback:${index}`,
    content: fact,
    metadata: {
      source: 'local-fallback',
      storyId: null,
      chunkIndex: index,
    },
    distance: null,
  }));

export const checkContinuity = async (scene, knownFacts = []) => {
  if (typeof scene !== 'string' || scene.trim().length === 0) {
    const error = new Error('Scene is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedScene = scene.trim();
  const normalizedKnownFacts = Array.isArray(knownFacts)
    ? knownFacts
        .filter((fact) => typeof fact === 'string')
        .map((fact) => fact.trim())
        .filter(Boolean)
    : [];
  const fallbackContext = () =>
    getFallbackContext(normalizedKnownFacts.length ? normalizedKnownFacts : fallbackFacts);
  let context;

  try {
    context = await searchRelevantContext(normalizedScene);
  } catch (error) {
    console.warn('Chroma retrieval failed. Using local fallback facts.');
    console.warn(error.message || error);
    context = fallbackContext();
  }

  if (!context.length) {
    context = fallbackContext();
  }

  const retrievedFacts = context
    .map((item) => item.content)
    .filter((content) => typeof content === 'string' && content.trim().length > 0);
  const analysis = await runContinuityAgent({
    scene: normalizedScene,
    retrievedFacts,
  });

  return {
    scene: normalizedScene,
    retrievedContext: context,
    retrievedFacts,
    contradiction: analysis.contradiction,
    reason: analysis.reason,
    confidence: analysis.confidence,
    type: analysis.type,
  };
};
