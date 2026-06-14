import { query } from '../config/db.js';
import {
  getLatestChapter,
  insertScenePath,
  updateSceneExpansion,
} from '../repositories/scene.repository.js';
import { searchMemory, searchRelevantContext } from './chroma.service.js';
import { runContinuityAgent } from './continuityAgent.js';
import { logEvent } from './agentLog.service.js';
import {
  expandScenePath,
  generateScenePaths,
} from './sceneGeneration.service.js';

const summarizeForLog = (value, maxLength = 1800) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const logSceneDebug = async ({ action, status = 'completed', metadata = {} }) => {
  try {
    await logEvent({
      agentName: 'Scene Debug Logger',
      actionType: 'scene_debug',
      action,
      description: action,
      status,
      duration: 0,
      metadata,
    });
  } catch (error) {
    console.warn('Scene debug log persistence failed.');
    console.warn(error.message || error);
  }
};

const loadStoryBible = async (storyId) => {
  const storyResult = await query(
    'SELECT id, title, content, created_at, updated_at FROM stories WHERE id = $1',
    [storyId]
  );
  const story = storyResult.rows[0];

  if (!story) {
    const error = new Error('Story not found.');
    error.statusCode = 404;
    throw error;
  }

  const [
    characters,
    locations,
    worldRules,
    relationships,
    researchEntries,
  ] = await Promise.all([
    query('SELECT id, name, description FROM characters WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, name, description FROM locations WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, rule, category FROM world_rules WHERE story_id = $1 OR story_id IS NULL ORDER BY id ASC', [storyId]),
    query('SELECT id, source, target, relation FROM relationships WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query(
      `
        SELECT id, query, executive_summary, summary, key_findings, technologies,
          challenges, opportunities, historical_evolution, story_opportunities
        FROM research_entries
        WHERE story_id = $1 OR story_id IS NULL
        ORDER BY id DESC
        LIMIT 12
      `,
      [storyId]
    ),
  ]);

  return {
    story,
    characters: characters.rows,
    locations: locations.rows,
    worldRules: worldRules.rows,
    relationships: relationships.rows,
    researchEntries: researchEntries.rows,
  };
};

const retrieveSceneContext = async ({ storyBible, selectedPath = '' }) => {
  const queries = [
    `character facts ${storyBible.story.title}`,
    `world rules relationships ${storyBible.story.title}`,
    `research entries ${storyBible.researchEntries.map((entry) => entry.query).join(' ')}`,
    `previous chapters ${storyBible.story.title}`,
    selectedPath,
  ].filter(Boolean);
  const results = [];

  for (const contextQuery of queries) {
    try {
      const memoryResults = await searchMemory(contextQuery);
      results.push(
        ...memoryResults.map((item) => ({
          ...item,
          sourceQuery: contextQuery,
          sourceCollection: 'story_memory',
        }))
      );
    } catch (error) {
      console.warn(`Chroma memory retrieval failed for "${contextQuery}".`);
      console.warn(error.message || error);
    }
  }

  try {
    const storyResults = await searchRelevantContext(
      `${storyBible.story.content} ${selectedPath}`.trim()
    );
    results.push(
      ...storyResults.map((item) => ({
        ...item,
        text: item.content,
        sourceQuery: 'previous chapters',
        sourceCollection: 'stories',
      }))
    );
  } catch (error) {
    console.warn('Chroma story context retrieval failed.');
    console.warn(error.message || error);
  }

  return results.slice(0, 20);
};

const buildContinuityFacts = ({ storyBible, retrievedMemory }) => [
  ...storyBible.characters.map((character) => `${character.name}: ${character.description || ''}`),
  ...storyBible.locations.map((location) => `${location.name}: ${location.description || ''}`),
  ...storyBible.worldRules.map((rule) => rule.rule),
  ...storyBible.relationships.map((relationship) => `${relationship.source} ${relationship.relation} ${relationship.target}`),
  ...storyBible.researchEntries.flatMap((entry) => [
    entry.executive_summary || entry.summary,
    ...(entry.key_findings || []),
    ...(entry.technologies || []),
    ...(entry.story_opportunities || []),
  ]),
  ...retrievedMemory.map((item) => item.text || item.content),
].filter((fact) => typeof fact === 'string' && fact.trim());

const detectMemoryConflicts = (facts = []) => {
  const normalizedFacts = facts
    .filter((fact) => typeof fact === 'string' && fact.trim())
    .map((fact) => fact.trim());
  const warnings = [];
  const hasCannotSwim = normalizedFacts.find((fact) => /\bcannot swim\b|\bcan't swim\b/i.test(fact));
  const hasExpertSwimmer = normalizedFacts.find((fact) => /\bexpert swimmer\b|\bcan swim\b|\bstrong swimmer\b/i.test(fact));
  const destroyedFacts = normalizedFacts.filter((fact) => /\b(?:is|was)\s+destroyed\b/i.test(fact));

  if (hasCannotSwim && hasExpertSwimmer) {
    warnings.push({
      type: 'Character Trait Memory Conflict',
      facts: [hasCannotSwim, hasExpertSwimmer],
      reason: 'Retrieved memory contains both cannot-swim and can-swim facts.',
    });
  }

  for (const destroyedFact of destroyedFacts) {
    const subject = destroyedFact.replace(/\b(?:is|was)\s+destroyed\b.*$/i, '').trim();
    if (!subject) continue;

    const presentFact = normalizedFacts.find((fact) =>
      fact !== destroyedFact &&
      new RegExp(`\\b${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fact) &&
      /\b(?:exists|appears|returns|is present|wields|uses)\b/i.test(fact)
    );

    if (presentFact) {
      warnings.push({
        type: 'Object State Memory Conflict',
        facts: [destroyedFact, presentFact],
        reason: `${subject} is both destroyed and later present in retrieved memory.`,
      });
    }
  }

  return warnings;
};

const validateSceneWithRetries = async ({
  storyBible,
  researchNotes,
  retrievedMemory,
  latestChapter,
  selectedPath,
  provider,
}) => {
  let previousAttempt = '';
  let continuityFeedback = null;
  let lastGenerated = null;
  let lastAnalysis = null;
  const retrievedFacts = buildContinuityFacts({ storyBible, retrievedMemory });
  const memoryConflictWarning = detectMemoryConflicts(retrievedFacts);

  await logSceneDebug({
    action: 'Scene validation started',
    metadata: {
      storyId: storyBible.story.id,
      selectedPath,
      storyBible: summarizeForLog({
        characters: storyBible.characters,
        locations: storyBible.locations,
        worldRules: storyBible.worldRules,
        relationships: storyBible.relationships,
      }),
      retrievedFacts: summarizeForLog(retrievedFacts),
      memoryConflictWarning,
    },
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const generated = await expandScenePath({
      provider,
      storyBible,
      researchNotes,
      retrievedMemory,
      latestChapter,
      selectedPath,
      previousAttempt,
      continuityFeedback,
    });
    const analysis = await runContinuityAgent({
      scene: generated.scene,
      retrievedFacts,
    });
    lastGenerated = generated;
    lastAnalysis = analysis;

    await logSceneDebug({
      action: `Scene validation attempt ${attempt + 1}`,
      status: analysis.contradiction ? 'failed' : 'completed',
      metadata: {
        storyId: storyBible.story.id,
        selectedPath,
        attempt: attempt + 1,
        generatedScene: summarizeForLog(generated.scene),
        continuityResponse: analysis,
        retryReason: analysis.contradiction ? analysis.reason || analysis.type : null,
        memoryConflictWarning,
      },
    });

    if (!analysis.contradiction) {
      return {
        ...generated,
        validation: analysis,
        attempts: attempt + 1,
        continuityWarning: null,
        memoryConflictWarning,
      };
    }

    previousAttempt = generated.scene;
    continuityFeedback = analysis;
  }

  await logSceneDebug({
    action: 'Scene validation returned with warning after maximum retries',
    status: 'failed',
    metadata: {
      storyId: storyBible.story.id,
      selectedPath,
      finalFailureReason: lastAnalysis?.reason || lastAnalysis?.type || 'Continuity validation failed.',
      continuityResponse: lastAnalysis,
      generatedScene: summarizeForLog(lastGenerated?.scene || previousAttempt),
      memoryConflictWarning,
    },
  });

  return {
    ...(lastGenerated || { scene: previousAttempt, confidence: 50 }),
    validation: lastAnalysis,
    attempts: 3,
    continuityWarning: lastAnalysis?.contradiction
      ? {
          contradiction: true,
          reason: lastAnalysis.reason || lastAnalysis.type || 'Continuity validation warning.',
          confidence: lastAnalysis.confidence || 0,
          type: lastAnalysis.type || 'Continuity Warning',
        }
      : null,
    memoryConflictWarning,
  };
};

export const generateSceneForStory = async (storyId, provider = 'openai') => {
  if (!storyId) {
    const error = new Error('Story ID is required.');
    error.statusCode = 400;
    throw error;
  }

  const storyBible = await loadStoryBible(storyId);
  const latestChapter = await getLatestChapter(storyId);
  const retrievedMemory = await retrieveSceneContext({ storyBible });
  const sceneGeneration = await generateScenePaths({
    provider,
    storyBible,
    researchNotes: storyBible.researchEntries,
    retrievedMemory,
    latestChapter,
  });
  const savedPaths = [];

  for (const path of sceneGeneration.paths) {
    savedPaths.push(await insertScenePath({
      storyId,
      pathTitle: path.title,
      pathSummary: path.summary,
      impact: path.impact,
      riskLevel: path.riskLevel,
      narrativeScore: path.narrativeScore,
    }));
  }

  return {
    storyId,
    provider: sceneGeneration.provider,
    storyBible,
    researchNotes: storyBible.researchEntries,
    retrievedMemory,
    latestChapter,
    paths: sceneGeneration.paths,
    savedPaths,
  };
};

export const expandSceneForStory = async ({ storyId, selectedPath, provider = 'openai' }) => {
  if (!storyId) {
    const error = new Error('Story ID is required.');
    error.statusCode = 400;
    throw error;
  }

  if (typeof selectedPath !== 'string' || selectedPath.trim().length === 0) {
    const error = new Error('Selected path is required.');
    error.statusCode = 400;
    throw error;
  }

  const storyBible = await loadStoryBible(storyId);
  const latestChapter = await getLatestChapter(storyId);
  const retrievedMemory = await retrieveSceneContext({
    storyBible,
    selectedPath,
  });
  const validated = await validateSceneWithRetries({
    provider,
    storyBible,
    researchNotes: storyBible.researchEntries,
    retrievedMemory,
    latestChapter,
    selectedPath: selectedPath.trim(),
  });
  const savedScene = await updateSceneExpansion({
    storyId,
    selectedPath: selectedPath.trim(),
    generatedScene: validated.scene,
    confidence: validated.confidence,
    validationStatus: validated.continuityWarning ? 'warning' : 'validated',
  });

  return {
    storyId,
    provider: validated.provider,
    selectedPath: selectedPath.trim(),
    scene: validated.scene,
    confidence: validated.confidence,
    validation: validated.validation,
    attempts: validated.attempts,
    continuityWarning: validated.continuityWarning,
    memoryConflictWarning: validated.memoryConflictWarning,
    savedScene,
  };
};
