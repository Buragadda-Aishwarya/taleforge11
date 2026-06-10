import OpenAI from 'openai';
import { env } from '../../config/env.js';

const stripJsonFence = (value) =>
  value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const parseSceneJson = (value) => {
  try {
    return JSON.parse(stripJsonFence(value));
  } catch (_error) {
    const error = new Error('OpenAI returned invalid scene JSON.');
    error.statusCode = 502;
    throw error;
  }
};

const fallbackScenePaths = ({ storyBible, retrievedContext }) => ({
  paths: [
    {
      title: 'Character Growth',
      summary: 'A central character confronts a limitation established in the Story Bible and chooses a harder, more honest path forward.',
      impact: `Deepens continuity by using ${storyBible.characters.length} known character facts and ${retrievedContext.length} retrieved context items.`,
      riskLevel: 'low',
    },
    {
      title: 'Conflict Escalation',
      summary: 'A practical pressure from the world rules turns into an immediate external threat, forcing the cast to act before they are ready.',
      impact: 'Raises stakes while preserving existing world logic.',
      riskLevel: 'medium',
    },
    {
      title: 'Major Twist',
      summary: 'A research-backed detail reveals that a trusted system in the world has been manipulated from the beginning.',
      impact: 'Creates a strong turn for the next chapter and reframes earlier scenes.',
      riskLevel: 'high',
    },
  ],
});

const getOpenAIClient = () => {
  if (!env.openaiApiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  return new OpenAI({
    apiKey: env.openaiApiKey,
  });
};

export const generateScenePaths = async ({ storyBible, retrievedContext }) => {
  const prompt = `
You are TaleForge AI's scene generation agent.

Use the Story Bible and retrieved context to generate exactly 3 possible next story paths.

Return JSON only with this exact shape:
{
  "paths": [
    {
      "title": "string",
      "summary": "string",
      "impact": "string",
      "riskLevel": "low | medium | high"
    }
  ]
}

Story Bible:
${JSON.stringify(storyBible, null, 2)}

Retrieved Context:
${JSON.stringify(retrievedContext, null, 2)}
`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.responses.create({
      model: env.openaiModel,
      input: prompt,
      text: {
        format: {
          type: 'json_object',
        },
      },
    });

    const parsed = parseSceneJson(response.output_text || '{}');

    return {
      paths: Array.isArray(parsed.paths) ? parsed.paths.slice(0, 3) : [],
    };
  } catch (error) {
    console.warn('OpenAI scene generation failed. Using local scene path fallback.');
    console.warn(error.message || error);
    return fallbackScenePaths({ storyBible, retrievedContext });
  }
};
