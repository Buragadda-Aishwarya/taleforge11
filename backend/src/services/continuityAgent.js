import Groq from 'groq-sdk';
import { env } from '../config/env.js';

const getGroqClient = () => {
  if (!env.groqApiKey) {
    const error = new Error('GROQ_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  return new Groq({
    apiKey: env.groqApiKey,
  });
};

const stripJsonFence = (value) =>
  value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const parseAgentJson = (value) => {
  try {
    return JSON.parse(stripJsonFence(value));
  } catch (_error) {
    const error = new Error('Groq returned invalid continuity JSON.');
    error.statusCode = 502;
    throw error;
  }
};

const buildPrompt = ({ scene, retrievedFacts }) => `
You are TaleForge AI's continuity reasoning agent.

Compare the scene against the retrieved facts.

Determine:
1. Contradiction?
2. Conflict type?
3. Confidence?
4. Explanation?

Return JSON only with this exact shape:
{
  "contradiction": boolean,
  "confidence": number,
  "type": "string",
  "reason": "string"
}

Confidence must be an integer from 0 to 100.
Use "None" for type when there is no contradiction.
Only use retrieved facts as evidence. Do not invent canon.

Example:
Known Facts:
- Aria cannot swim
- Aria hates magic

Scene:
Aria swims across the ocean.

Expected JSON:
{
  "contradiction": true,
  "confidence": 94,
  "type": "Character Trait Violation",
  "reason": "Aria cannot swim."
}

Scene:
"""${scene}"""

Retrieved facts:
${retrievedFacts.map((fact, index) => `${index + 1}. ${fact}`).join('\n')}
`;

const runLocalContinuityCheck = ({ scene, retrievedFacts }) => {
  const normalizedScene = scene.toLowerCase();
  const swimFact = retrievedFacts.find((fact) => /cannot swim/i.test(fact));

  if (swimFact && /\bswim|swims|swimming|swam\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 94,
      type: 'Character Trait Violation',
      reason: swimFact.replace(/\.$/, ''),
    };
  }

  return {
    contradiction: false,
    confidence: 75,
    type: 'None',
    reason: '',
  };
};

export const runContinuityAgent = async ({ scene, retrievedFacts }) => {
  if (typeof scene !== 'string' || scene.trim().length === 0) {
    const error = new Error('Scene is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(retrievedFacts)) {
    const error = new Error('Retrieved facts must be an array.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedFacts = retrievedFacts
    .filter((fact) => typeof fact === 'string')
    .map((fact) => fact.trim())
    .filter(Boolean);

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: env.groqModel,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a strict continuity checker. Return only valid JSON.',
        },
        {
          role: 'user',
          content: buildPrompt({
            scene: scene.trim(),
            retrievedFacts: normalizedFacts,
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      const error = new Error('Groq did not return continuity agent output.');
      error.statusCode = 502;
      throw error;
    }

    const parsed = parseAgentJson(content);
    const confidence = Number(parsed.confidence);

    return {
      contradiction: Boolean(parsed.contradiction),
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, Math.round(confidence))) : 0,
      type: typeof parsed.type === 'string' && parsed.type.trim() ? parsed.type.trim() : 'None',
      reason: typeof parsed.reason === 'string' ? parsed.reason.trim().replace(/\.$/, '') : '',
    };
  } catch (error) {
    console.warn('Groq continuity check failed. Falling back to local continuity check.');
    console.warn(error.message || error);
    return runLocalContinuityCheck({
      scene: scene.trim(),
      retrievedFacts: normalizedFacts,
    });
  }
};
