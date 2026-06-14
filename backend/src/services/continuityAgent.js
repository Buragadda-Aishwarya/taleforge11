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

Only flag these continuity failures:
- Character Trait Violation
- World Rule Violation
- Timeline Contradiction
- Relationship Contradiction

Ignore style differences, missing details, harmless assumptions, alternate wording,
new creative details that do not contradict canon, and facts that are not clearly tied
to the same character/object/place.

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

const allowedConflictTypes = [
  'character trait violation',
  'world rule violation',
  'timeline contradiction',
  'timeline violation',
  'relationship contradiction',
  'character relationship violation',
  'relationship continuity violation',
];

const normalizeAllowedAnalysis = (analysis) => {
  if (!analysis.contradiction) {
    return {
      ...analysis,
      contradiction: false,
      type: 'None',
    };
  }

  const normalizedType = String(analysis.type || '').toLowerCase();
  const isAllowed = allowedConflictTypes.some((type) => normalizedType.includes(type));

  if (!isAllowed) {
    return {
      contradiction: false,
      confidence: Math.min(Number(analysis.confidence) || 0, 70),
      type: 'None',
      reason: 'Ignored non-continuity issue.',
    };
  }

  return analysis;
};

const extractNames = (value) =>
  [...String(value || '').matchAll(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g)]
    .map((match) => match[0])
    .filter((name) => !['The', 'A', 'An', 'This', 'That', 'Scene', 'Role'].includes(name));

const evidenceSupportsAnalysis = ({ scene, retrievedFacts, analysis }) => {
  if (!analysis.contradiction) return analysis;

  const normalizedType = String(analysis.type || '').toLowerCase();
  const normalizedScene = scene.toLowerCase();

  if (normalizedType.includes('relationship')) {
    const relationshipFact = retrievedFacts.find((fact) =>
      /\b(?:never met|has never met|mentors|married|wife|husband|son|daughter|parent|sibling)\b/i.test(fact)
    );
    const names = extractNames(`${relationshipFact || ''} ${analysis.reason || ''}`);
    const uniqueNames = [...new Set(names)].slice(0, 2);
    const allNamesInScene = uniqueNames.length >= 2 && uniqueNames.every((name) =>
      new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(scene)
    );

    if (!allNamesInScene) {
      return {
        contradiction: false,
        confidence: Math.min(Number(analysis.confidence) || 0, 65),
        type: 'None',
        reason: 'Ignored relationship assumption because the scene does not clearly involve both related entities.',
      };
    }
  }

  if (normalizedType.includes('timeline')) {
    const hasHardTimelineSignal =
      /\b(?:died|dead|buried|funeral|mourned|destroyed)\b/i.test(normalizedScene) ||
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}:\d{2}|\d{4})\b/i.test(normalizedScene);

    if (!hasHardTimelineSignal) {
      return {
        contradiction: false,
        confidence: Math.min(Number(analysis.confidence) || 0, 65),
        type: 'None',
        reason: 'Ignored timeline assumption because the scene does not contain a hard timeline contradiction.',
      };
    }
  }

  return analysis;
};

const extractFactSubject = (fact) => {
  const text = String(fact || '').trim();
  const beforeColon = text.split(':')[0]?.trim();
  if (beforeColon && /^[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?$/.test(beforeColon)) {
    return beforeColon;
  }

  const match = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  return match?.[1] || '';
};

const sameSubjectAppears = (scene, fact) => {
  const subject = extractFactSubject(fact);
  if (!subject) return true;
  return new RegExp(`\\b${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(scene);
};

const runLocalContinuityCheck = ({ scene, retrievedFacts }) => {
  const normalizedScene = scene.toLowerCase();
  const swimFact = retrievedFacts.find((fact) => /cannot swim/i.test(fact));
  const destroyedFact = retrievedFacts.find((fact) => /\b(?:was|is)\s+destroyed\b/i.test(fact));
  const deathFact = retrievedFacts.find((fact) => /\b(?:died|dead|buried|funeral|mourned)\b/i.test(fact));
  const neverHadChildrenFact = retrievedFacts.find((fact) => /\bnever had children\b|\bno children\b/i.test(fact));
  const neverMetFact = retrievedFacts.find((fact) => /\bnever met\b|\bhad never met\b/i.test(fact));
  const brokenWatchFact = retrievedFacts.find((fact) => /\bwatch\b.*\b(?:broken|stopped working)\b/i.test(fact));
  const noMagicFact = retrievedFacts.find((fact) => /\bmagic does not exist\b|\bno magic exists\b/i.test(fact));

  if (swimFact && /\bswim|swims|swimming|swam\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 94,
      type: 'Character Trait Violation',
      reason: swimFact.replace(/\.$/, ''),
    };
  }

  if (destroyedFact) {
    const destroyedEntity = destroyedFact
      .replace(/\b(?:was|is)\s+destroyed\b.*$/i, '')
      .trim();

    if (
      destroyedEntity &&
      normalizedScene.includes(destroyedEntity.toLowerCase())
    ) {
      return {
        contradiction: true,
        confidence: 92,
        type: 'Lore Violation',
        reason: destroyedFact.replace(/\.$/, ''),
      };
    }
  }

  if (
    deathFact &&
    sameSubjectAppears(scene, deathFact) &&
    /\b(?:walked|walks|alive|greeting|speaks|appeared|appears|living|buying|returns?|returned)\b/i.test(normalizedScene)
  ) {
    return {
      contradiction: true,
      confidence: 96,
      type: 'Timeline Violation',
      reason: deathFact.replace(/\.$/, ''),
    };
  }

  if (neverHadChildrenFact && /\b(?:son|daughter|child|children)\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 93,
      type: 'Character Relationship Violation',
      reason: neverHadChildrenFact.replace(/\.$/, ''),
    };
  }

  if (neverMetFact && /\b(?:recognized|recognised|remembered|knew|greeted)\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 91,
      type: 'Relationship Contradiction',
      reason: neverMetFact.replace(/\.$/, ''),
    };
  }

  if (brokenWatchFact && /\b(?:exactly|at)\s+\d{1,2}:\d{2}\s*(?:am|pm)?\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 90,
      type: 'Timeline Tool Violation',
      reason: brokenWatchFact.replace(/\.$/, ''),
    };
  }

  if (noMagicFact && /\b(?:magic|magical|enchanted|spell|sorcery|wizard|witch)\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 92,
      type: 'World Rule Violation',
      reason: noMagicFact.replace(/\.$/, ''),
    };
  }

  if (/\bnever owned\b.*\b(book|sword|ring|necklace|watch)\b/i.test(normalizedScene) && /\bstill\b.*\b(open|lying|there|present)\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 88,
      type: 'Object Continuity Violation',
      reason: 'The scene denies ownership while the object remains present.',
    };
  }

  if (/\b(?:died|dead|buried|funeral|mourned)\b[\s\S]*\b(?:walked|walks|alive|greeting|appeared|living|buying|returns?)\b/i.test(normalizedScene)) {
    return {
      contradiction: true,
      confidence: 94,
      type: 'Timeline Violation',
      reason: 'The scene establishes a death or burial and later shows the same character alive.',
    };
  }

  return {
    contradiction: false,
    confidence: 75,
    type: 'None',
    reason: '',
  };
};

const applyConsistencyOverrides = ({ scene, retrievedFacts, analysis }) => {
  const normalizedScene = scene.toLowerCase();
  const magicAversionFact = retrievedFacts.find((fact) => /\bhates?\s+magic\b|\bfears?\s+magic\b|\bavoids?\s+magic\b/i.test(fact));

  if (
    magicAversionFact &&
    /\b(refuses?|rejects?|avoids?|declines?|will not|won't|does not|doesn't)\b/i.test(normalizedScene) &&
    /\bmagic|enchanted|spell|sorcery|wizard|witch|tower\b/i.test(normalizedScene)
  ) {
    return normalizeAllowedAnalysis({
      contradiction: false,
      confidence: Math.max(Number(analysis.confidence) || 0, 91),
      type: 'None',
      reason: 'Scene behavior is consistent with the character avoiding magic.',
    });
  }

  return normalizeAllowedAnalysis(analysis);
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
  const localAnalysis = runLocalContinuityCheck({
    scene: scene.trim(),
    retrievedFacts: normalizedFacts,
  });

  if (localAnalysis.contradiction) {
    return normalizeAllowedAnalysis(localAnalysis);
  }

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

    const normalizedAnalysis = {
      contradiction: Boolean(parsed.contradiction),
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, Math.round(confidence))) : 0,
      type: typeof parsed.type === 'string' && parsed.type.trim() ? parsed.type.trim() : 'None',
      reason: typeof parsed.reason === 'string' ? parsed.reason.trim().replace(/\.$/, '') : '',
    };

    return applyConsistencyOverrides({
      scene: scene.trim(),
      retrievedFacts: normalizedFacts,
      analysis: evidenceSupportsAnalysis({
        scene: scene.trim(),
        retrievedFacts: normalizedFacts,
        analysis: normalizedAnalysis,
      }),
    });
  } catch (error) {
    console.warn('Groq continuity check failed. Falling back to local continuity check.');
    console.warn(error.message || error);
    return applyConsistencyOverrides({
      scene: scene.trim(),
      retrievedFacts: normalizedFacts,
      analysis: localAnalysis,
    });
  }
};
