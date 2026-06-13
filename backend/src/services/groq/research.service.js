import Groq from 'groq-sdk';
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
    const error = new Error('Groq returned invalid research JSON.');
    error.statusCode = 502;
    throw error;
  }
};


const getGroqClient = () => {
  if (!env.groqApiKey) {
    const error = new Error('GROQ_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  return new Groq({ apiKey: env.groqApiKey });
};

const asStringArray = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => (typeof item === 'string' ? item : item?.text || item?.summary || item?.title || item?.name))
        .filter((item) => typeof item === 'string' && item.trim())
        .map((item) => item.trim())
    : [];

const asObjectArray = (items) => (Array.isArray(items) ? items.filter((item) => item && typeof item === 'object') : []);

const normalizeSources = (items) =>
  asObjectArray(items).map((source) => ({
    title: String(source.title || 'Untitled Source').trim(),
    category: String(source.category || source.type || 'Research Lead').trim(),
    trustScore: Math.max(0, Math.min(100, Number.parseInt(source.trustScore, 10) || 70)),
    url: typeof source.url === 'string' ? source.url.trim() : '',
  }));

const normalizeNodes = (items) =>
  asObjectArray(items).map((node) => ({
    label: String(node.label || node.name || 'Context Node').trim(),
    type: String(node.type || 'Topic').trim(),
    description: String(node.description || '').trim(),
    parentLabel: String(node.parentLabel || node.parent || '').trim(),
  }));

const normalizeAssets = (assets = {}) => ({
  character: {
    name: assets.character?.name || 'Research Character',
    description: assets.character?.description || '',
    role: assets.character?.role || 'Research Concept',
  },
  location: {
    name: assets.location?.name || 'Research Location',
    description: assets.location?.description || '',
    significance: assets.location?.significance || '',
  },
  faction: {
    name: assets.faction?.name || 'Research Faction',
    description: assets.faction?.description || '',
    goal: assets.faction?.goal || '',
  },
  worldRule: {
    rule: assets.worldRule?.rule || '',
    category: assets.worldRule?.category || 'Research Rule',
    narrativeUse: assets.worldRule?.narrativeUse || '',
  },
  conflict: {
    name: assets.conflict?.name || 'Research Conflict',
    description: assets.conflict?.description || '',
    stakes: assets.conflict?.stakes || '',
  },
  plotHook: {
    title: assets.plotHook?.title || 'Research Plot Hook',
    description: assets.plotHook?.description || '',
    payoff: assets.plotHook?.payoff || '',
  },
});

const buildPrompt = (researchQuery) => `
You are TaleForge AI's Groq Research Nexus.

Research the user's topic deeply enough for fiction worldbuilding and narrative design.
Use your model knowledge to synthesize details, systems, constraints, historical context,
technologies, risks, opportunities, and story applications.

Topic:
"""${researchQuery.trim()}"""

Return JSON only with this exact shape:
{
  "executiveSummary": "string",
  "keyFindings": ["string"],
  "technologies": ["string"],
  "challenges": ["string"],
  "opportunities": ["string"],
  "historicalEvolution": [
    { "period": "string", "label": "string", "description": "string" }
  ],
  "storyOpportunities": ["string"],
  "sources": [
    { "title": "string", "category": "string", "trustScore": 0, "url": "string" }
  ],
  "contextualNodes": [
    { "label": "string", "type": "string", "description": "string", "parentLabel": "string" }
  ],
  "storyAssets": {
    "character": { "name": "string", "role": "string", "description": "string" },
    "location": { "name": "string", "description": "string", "significance": "string" },
    "faction": { "name": "string", "description": "string", "goal": "string" },
    "worldRule": { "rule": "string", "category": "string", "narrativeUse": "string" },
    "conflict": { "name": "string", "description": "string", "stakes": "string" },
    "plotHook": { "title": "string", "description": "string", "payoff": "string" }
  },
  "aiIdeationDrafts": {
    "characterConcepts": ["string"],
    "worldRules": ["string"],
    "factions": ["string"],
    "plotHooks": ["string"],
    "conflictIdeas": ["string"]
  }
}

Source rules:
- Provide credible source leads. Include URLs only when you are confident they are real.
- trustScore must be an integer from 0 to 100 based on reliability.
- Do not invent fake URLs.

Context node rules:
- Include a root node for the topic and 4-8 related nodes.
- Use parentLabel to connect child concepts to the topic or to another node.
- Example for Travelling Agents: Distributed Intelligence, Memory Sharing,
  Autonomous Systems, Multi-Agent Networks.
`;


export const runGroqResearch = async (researchQuery) => {
  if (typeof researchQuery !== 'string' || researchQuery.trim().length === 0) {
    const error = new Error('Research query is required.');
    error.statusCode = 400;
    throw error;
  }

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: env.groqModel,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are Groq Research Nexus for TaleForge AI. Return valid JSON only.',
      },
      {
        role: 'user',
        content: buildPrompt(researchQuery),
      },
    ],
  });
  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    const error = new Error('Groq did not return research output.');
    error.statusCode = 502;
    throw error;
  }

  const parsed = parseResearchJson(content);

  return {
    query: researchQuery.trim(),
    executiveSummary: parsed.executiveSummary || parsed.summary || '',
    summary: parsed.executiveSummary || parsed.summary || '',
    keyFindings: asStringArray(parsed.keyFindings),
    technologies: asStringArray(parsed.technologies),
    challenges: asStringArray(parsed.challenges),
    opportunities: asStringArray(parsed.opportunities),
    historicalEvolution: asObjectArray(parsed.historicalEvolution).map((item) => ({
      period: String(item.period || '').trim(),
      label: String(item.label || '').trim(),
      description: String(item.description || '').trim(),
    })),
    storyOpportunities: asStringArray(parsed.storyOpportunities),
    storyIdeas: asStringArray(parsed.storyOpportunities || parsed.storyIdeas),
    sources: normalizeSources(parsed.sources),
    contextualNodes: normalizeNodes(parsed.contextualNodes),
    storyAssets: normalizeAssets(parsed.storyAssets),
    aiIdeationDrafts: {
      characterConcepts: asStringArray(parsed.aiIdeationDrafts?.characterConcepts),
      worldRules: asStringArray(parsed.aiIdeationDrafts?.worldRules),
      factions: asStringArray(parsed.aiIdeationDrafts?.factions),
      plotHooks: asStringArray(parsed.aiIdeationDrafts?.plotHooks),
      conflictIdeas: asStringArray(parsed.aiIdeationDrafts?.conflictIdeas),
    },
  };
};
