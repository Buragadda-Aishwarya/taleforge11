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

const getOpenAIClient = () => {
  if (!env.openaiApiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.statusCode = 503;
    error.expose = true;
    throw error;
  }

  return new OpenAI({ apiKey: env.openaiApiKey });
};

const requestOpenAIJson = async (prompt) => {
  const openai = getOpenAIClient();

  try {
    const response = await openai.responses.create({
      model: env.openaiModel,
      input: prompt,
      text: {
        format: { type: 'json_object' },
      },
    });

    return response.output_text || '{}';
  } catch (requestError) {
    const error = new Error(
      `OpenAI request failed: ${requestError.message || 'Unknown provider error.'}`
    );
    error.statusCode = requestError.status || requestError.statusCode || 502;
    error.expose = true;
    throw error;
  }
};

const normalizePaths = (paths = []) => {
  const requiredTitles = [
    'Character Growth',
    'Conflict Escalation',
    'Major Plot Twist',
  ];

  return requiredTitles.map((title, index) => {
    const candidate = paths.find((path) =>
      String(path?.title || '').toLowerCase().includes(title.toLowerCase())
    ) || paths[index] || {};
    const score = Number.parseInt(candidate.narrativeScore, 10);

    return {
      title,
      summary: candidate.summary || '',
      impact: candidate.impact || '',
      riskLevel: candidate.riskLevel || candidate.risk_level || (index === 0 ? 'low' : index === 1 ? 'medium' : 'high'),
      narrativeScore: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 90 - index * 5,
    };
  });
};

export const generateScenePaths = async ({
  storyBible,
  researchNotes,
  retrievedMemory,
  latestChapter,
}) => {
  const prompt = `
You are TaleForge AI's narrative path generator.

Generate exactly 3 next-scene paths:
1. Character Growth
2. Conflict Escalation
3. Major Plot Twist

Use:
- Story Bible entities and relationships
- Research notes as subtle inspiration
- Retrieved memory from ChromaDB
- Latest chapter continuity

Return JSON only:
{
  "paths": [
    {
      "title": "Character Growth",
      "summary": "string",
      "impact": "string",
      "riskLevel": "low | medium | high",
      "narrativeScore": 0
    },
    {
      "title": "Conflict Escalation",
      "summary": "string",
      "impact": "string",
      "riskLevel": "low | medium | high",
      "narrativeScore": 0
    },
    {
      "title": "Major Plot Twist",
      "summary": "string",
      "impact": "string",
      "riskLevel": "low | medium | high",
      "narrativeScore": 0
    }
  ]
}

Story Bible:
${JSON.stringify(storyBible, null, 2)}

Research Notes:
${JSON.stringify(researchNotes, null, 2)}

Retrieved Memory:
${JSON.stringify(retrievedMemory, null, 2)}

Latest Chapter:
"""${latestChapter?.content || ''}"""
`;

  const responseText = await requestOpenAIJson(prompt);
  const parsed = parseSceneJson(responseText);

  return {
    paths: normalizePaths(Array.isArray(parsed.paths) ? parsed.paths : []),
  };
};

export const expandScenePath = async ({
  storyBible,
  researchNotes,
  retrievedMemory,
  latestChapter,
  selectedPath,
  previousAttempt,
  continuityFeedback,
}) => {
  const prompt = `
You are TaleForge AI's scene expansion agent.

Generate an 800-1200 word polished story scene from the selected path.

Requirements:
- Maintain continuity.
- Respect all world rules.
- Respect character traits and relationships.
- Use retrieved memory from ChromaDB.
- Use research notes as natural inspiration, never as an info dump.
- Avoid contradictions identified in continuity feedback.

Return JSON only:
{
  "scene": "string",
  "confidence": 0
}

Selected Path:
"""${selectedPath}"""

Continuity Feedback:
${JSON.stringify(continuityFeedback || null, null, 2)}

Correction Instructions:
${continuityFeedback?.contradiction
  ? `The previous attempt failed continuity validation. Violation: "${continuityFeedback.reason || continuityFeedback.type}". Generate a corrected scene that directly respects this fact. Do not repeat the violating action, relationship, timeline event, or world-rule break.`
  : 'No prior continuity violation. Maintain existing canon.'}

Previous Attempt To Avoid:
"""${previousAttempt || ''}"""

Story Bible:
${JSON.stringify(storyBible, null, 2)}

Research Notes:
${JSON.stringify(researchNotes, null, 2)}

Retrieved Memory:
${JSON.stringify(retrievedMemory, null, 2)}

Latest Chapter:
"""${latestChapter?.content || ''}"""
`;

  const responseText = await requestOpenAIJson(prompt);
  const parsed = parseSceneJson(responseText);
  const confidence = Number.parseInt(parsed.confidence, 10);

  if (typeof parsed.scene !== 'string' || parsed.scene.trim().length === 0) {
    const error = new Error('OpenAI returned an empty generated scene.');
    error.statusCode = 502;
    throw error;
  }

  return {
    scene: parsed.scene.trim(),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence)) : 80,
  };
};
