import { RunnableLambda } from '@langchain/core/runnables';
import { checkContinuity } from '../continuity.service.js';
import { getStoryGraph } from '../graph.service.js';
import { queryResearchAgent } from '../research.service.js';
import { generateSceneForStory } from '../scene.service.js';
import { withAgentLog } from '../agentLog.service.js';

const agentDefinitions = {
  research: {
    agentName: 'Research Agent',
    provider: 'Groq',
    action: (payload) => `Query: ${payload.researchQuery}`,
    handler: ({ researchQuery }) => queryResearchAgent(researchQuery),
  },
  continuity: {
    agentName: 'Continuity Agent',
    provider: 'Groq',
    action: (payload) => `Scene continuity check: ${payload.scene}`,
    handler: ({ scene, knownFacts, storyId }) => checkContinuity(scene, knownFacts, storyId),
  },
  scene: {
    agentName: 'Scene Generation Agent',
    provider: ({ provider }) => provider ? provider.toString().toUpperCase() : 'OPENAI',
    action: (payload) => `Generate scene paths for story ${payload.storyId} via ${payload.provider || 'OpenAI'}`,
    handler: ({ storyId, provider }) => generateSceneForStory(storyId, provider),
  },
  graph: {
    agentName: 'Graph Agent',
    provider: 'LangChain',
    action: (payload) => `Build knowledge graph for story ${payload.storyId}`,
    handler: ({ storyId }) => getStoryGraph(storyId),
  },
};

const router = RunnableLambda.from(async ({ type, payload }) => {
  const definition = agentDefinitions[type];

  if (!definition) {
    const error = new Error(`Unknown agent route: ${type}`);
    error.statusCode = 400;
    throw error;
  }

  const provider =
    typeof definition.provider === 'function'
      ? definition.provider(payload)
      : definition.provider;

  return withAgentLog(
    {
      agentName: definition.agentName,
      action: definition.action(payload),
      metadata: {
        provider,
        route: type,
      },
    },
    () => definition.handler(payload)
  );
});

export const routeAgentTask = ({ type, payload }) => router.invoke({ type, payload });
