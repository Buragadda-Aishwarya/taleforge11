import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

const stripJsonFence = (value) =>
  value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const parseResearchJson = (value) => {
  try {
    return JSON.parse(stripJsonFence(value));
  } catch (_error) {
    const error = new Error('Gemini returned invalid research JSON.');
    error.statusCode = 502;
    throw error;
  }
};

const getResearchModel = () => {
  if (!env.geminiApiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  return genAI.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.35,
    },
  });
};

const fallbackResearch = (researchQuery) => {
  const query = researchQuery.trim();

  if (/roman|rome|legion|military logistics/i.test(query)) {
    return {
      summary: 'Roman armies relied on disciplined supply chains, road networks, fortified camps, depots, pack animals, river and sea transport, and dedicated officers who coordinated food, fodder, equipment, and marching schedules.',
      keyFindings: [
        'Military roads let legions move supplies and messages across long distances.',
        'Fortified camps and depots stored grain, tools, weapons, and replacement equipment.',
        'Quartermasters, engineers, mule drivers, sailors, and local contractors were as vital as soldiers.',
        'Armies depended on grain supply, animal fodder, water access, and seasonal campaign planning.',
        'Control of ports, bridges, river crossings, and roads could decide a campaign before battle began.',
      ],
      storyIdeas: [
        'An empire controls rebellious provinces by controlling road junctions and grain depots.',
        'A campaign collapses when a hidden faction sabotages fodder supplies instead of attacking soldiers.',
        'A frontier fortress becomes politically powerful because every legion must pass through its warehouses.',
      ],
      characterIdeas: [
        'A quartermaster general who can predict wars by watching grain prices.',
        'A muleteer spy who hears every secret while moving supplies between camps.',
        'An engineer responsible for bridges whose failure could doom an entire legion.',
      ],
      worldBuildingIdeas: [
        'Military roads double as trade arteries and instruments of imperial surveillance.',
        'Every major town must maintain emergency granaries for marching armies.',
        'Supply tokens, sealed manifests, and road permits become tools of corruption and rebellion.',
      ],
    };
  }

  return {
    summary: `Research notes for ${query}, converted into story-ready material.`,
    keyFindings: [
      'Identify the practical systems that keep this topic functioning.',
      'Look for hidden workers, bottlenecks, infrastructure, and points of failure.',
      'Convert constraints into conflict, status, and plot pressure.',
    ],
    storyIdeas: [
      `A powerful faction controls the infrastructure behind ${query}.`,
      `A small failure in ${query} exposes a larger political conspiracy.`,
    ],
    characterIdeas: [
      `A specialist whose expertise in ${query} makes them unexpectedly powerful.`,
    ],
    worldBuildingIdeas: [
      `${query} shapes laws, social rank, trade, and everyday survival.`,
    ],
  };
};

export const runGeminiResearch = async (researchQuery) => {
  if (typeof researchQuery !== 'string' || researchQuery.trim().length === 0) {
    const error = new Error('Research query is required.');
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
You are TaleForge AI's Gemini Research Agent for fiction writers.

Research topic:
"""${researchQuery.trim()}"""

Return JSON only with this exact shape:
{
  "summary": "string",
  "keyFindings": ["string"],
  "storyIdeas": ["string"],
  "characterIdeas": ["string"],
  "worldBuildingIdeas": ["string"]
}

Rules:
- Be concise but useful for a novelist.
- Convert factual research into story-ready material.
- Do not include markdown.
- If the topic is historical, focus on logistics, power structures, daily life, constraints, and narrative tension.
`;

  let parsed;

  try {
    const model = getResearchModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    parsed = parseResearchJson(text);
  } catch (error) {
    console.warn('Gemini research failed. Using local research fallback.');
    console.warn(error.message || error);
    parsed = fallbackResearch(researchQuery);
  }

  return {
    summary: parsed.summary || '',
    keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
    storyIdeas: Array.isArray(parsed.storyIdeas) ? parsed.storyIdeas : [],
    characterIdeas: Array.isArray(parsed.characterIdeas) ? parsed.characterIdeas : [],
    worldBuildingIdeas: Array.isArray(parsed.worldBuildingIdeas) ? parsed.worldBuildingIdeas : [],
  };
};
