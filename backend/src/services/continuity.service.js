import { searchRelevantContext } from './chroma.service.js';
import { runContinuityAgent } from './continuityAgent.js';
import { query } from '../config/db.js';
import { performance } from 'node:perf_hooks';

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

const mapContinuityCheck = (row) => ({
  id: row.id,
  storyId: row.story_id,
  scene: row.scene,
  contradiction: row.contradiction,
  type: row.conflict_type,
  reason: row.reason,
  confidence: row.confidence || 0,
  retrievedFacts: row.retrieved_facts || [],
  status: row.status,
  scanTimeMs: row.scan_time_ms || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const saveContinuityCheck = async ({ storyId, scene, retrievedFacts, analysis, scanTimeMs }) => {
  const normalizedStoryId =
    storyId === null || storyId === undefined || storyId === ''
      ? null
      : Number.isInteger(Number(storyId))
        ? Number(storyId)
        : null;
  const result = await query(
    `
      INSERT INTO continuity_checks (
        story_id,
        scene,
        contradiction,
        conflict_type,
        reason,
        confidence,
        retrieved_facts,
        status,
        scan_time_ms
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, story_id, scene, contradiction, conflict_type, reason, confidence, retrieved_facts, status, scan_time_ms, created_at, updated_at;
    `,
    [
      normalizedStoryId,
      scene,
      Boolean(analysis.contradiction),
      analysis.type || 'None',
      analysis.reason || '',
      Number.parseInt(analysis.confidence, 10) || 0,
      JSON.stringify(retrievedFacts || []),
      analysis.contradiction ? 'active' : 'resolved',
      scanTimeMs || 0,
    ]
  );

  return mapContinuityCheck(result.rows[0]);
};

export const checkContinuity = async (scene, knownFacts = [], storyId = null) => {
  if (typeof scene !== 'string' || scene.trim().length === 0) {
    const error = new Error('Scene is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedScene = scene.trim();
  const scanStartedAt = performance.now();
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

  const retrievedFacts = [
    ...normalizedKnownFacts,
    ...context
    .map((item) => item.content)
    .filter((content) => typeof content === 'string' && content.trim().length > 0),
  ].filter((fact, index, facts) => facts.findIndex((candidate) => candidate.toLowerCase() === fact.toLowerCase()) === index);
  const analysis = await runContinuityAgent({
    scene: normalizedScene,
    retrievedFacts,
  });
  const scanTimeMs = Math.max(1, Math.round(performance.now() - scanStartedAt));
  let savedCheck = null;

  try {
    savedCheck = await saveContinuityCheck({
      storyId,
      scene: normalizedScene,
      retrievedFacts,
      analysis,
      scanTimeMs,
    });
  } catch (error) {
    console.warn('Continuity graph persistence failed.');
    console.warn(error.message || error);
  }

  return {
    scene: normalizedScene,
    retrievedContext: context,
    retrievedFacts,
    contradiction: analysis.contradiction,
    reason: analysis.reason,
    confidence: analysis.confidence,
    type: analysis.type,
    scanTimeMs,
    savedCheck,
  };
};

export const listContinuityChecks = async ({ status = 'history', limit = 100 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number.parseInt(limit, 10) || 100, 200));
  const values = [];
  const filters = [];

  if (status && status !== 'history') {
    values.push(status);
    filters.push(`status = $${values.length}`);
    if (status === 'active') {
      filters.push('contradiction = TRUE');
    }
  }

  values.push(safeLimit);
  const result = await query(
    `
      SELECT id, story_id, scene, contradiction, conflict_type, reason, confidence,
        retrieved_facts, status, scan_time_ms, created_at, updated_at
      FROM continuity_checks
      ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length};
    `,
    values
  );

  return result.rows.map(mapContinuityCheck);
};

export const updateContinuityCheckStatus = async (id, status) => {
  if (!['active', 'ignored', 'resolved'].includes(status)) {
    const error = new Error('Invalid continuity check status.');
    error.statusCode = 400;
    throw error;
  }

  const result = await query(
    `
      UPDATE continuity_checks
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, story_id, scene, contradiction, conflict_type, reason, confidence,
        retrieved_facts, status, scan_time_ms, created_at, updated_at;
    `,
    [id, status]
  );

  if (!result.rows[0]) {
    const error = new Error('Continuity check not found.');
    error.statusCode = 404;
    throw error;
  }

  return mapContinuityCheck(result.rows[0]);
};
