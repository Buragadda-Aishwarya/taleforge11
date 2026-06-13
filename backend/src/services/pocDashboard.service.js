import { query } from '../config/db.js';
import { getLatestEvaluationMetrics } from './evaluation.service.js';

const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

const percentage = (numerator, denominator) =>
  denominator > 0 ? round((Number(numerator) / Number(denominator)) * 100) : 0;

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, round(value)));

const metric = ({ label, value, unit = '', description = '', trend = 'neutral' }) => ({
  label,
  value,
  unit,
  description,
  trend,
});

const getOne = async (sql, params = []) => {
  const result = await query(sql, params);
  return result.rows[0] || {};
};

const getRecentActivity = async () => {
  const result = await query(`
    SELECT id, agent_name, action_type, action, description, timestamp, status, duration, metadata
    FROM agent_logs
    WHERE timestamp >= NOW() - INTERVAL '10 days'
    ORDER BY timestamp DESC, id DESC
    LIMIT 12;
  `);

  return result.rows.map((row) => ({
    id: row.id,
    agentName: row.agent_name,
    actionType: row.action_type || row.metadata?.route || 'agent_action',
    action: row.action,
    description: row.description || row.action,
    timestamp: row.timestamp,
    status: row.status,
    duration: Number(row.duration || 0),
    metadata: row.metadata || {},
  }));
};

const getContinuityMetrics = async () => {
  const latestEvaluation = await getLatestEvaluationMetrics();
  const stats = await getOne(`
    SELECT
      COUNT(*)::INTEGER AS total_checks,
      COUNT(*) FILTER (WHERE contradiction = TRUE)::INTEGER AS contradictions,
      COUNT(*) FILTER (WHERE status = 'active')::INTEGER AS active,
      COUNT(*) FILTER (WHERE status = 'ignored')::INTEGER AS ignored,
      COUNT(*) FILTER (WHERE status = 'resolved')::INTEGER AS resolved,
      COALESCE(AVG(confidence), 0)::NUMERIC(10, 2) AS average_confidence,
      COALESCE(AVG(scan_time_ms), 0)::NUMERIC(10, 2) AS average_scan_time
    FROM continuity_checks;
  `);
  const accuracy = latestEvaluation?.metrics?.contradictionAccuracy || 0;

  return {
    accuracy,
    totalChecks: Number(stats.total_checks || 0),
    contradictions: Number(stats.contradictions || 0),
    active: Number(stats.active || 0),
    ignored: Number(stats.ignored || 0),
    resolved: Number(stats.resolved || 0),
    averageConfidence: round(stats.average_confidence),
    averageScanTime: round(stats.average_scan_time),
  };
};

const getStoryBibleCoverage = async () => {
  const stats = await getOne(`
    SELECT
      (SELECT COUNT(*) FROM stories)::INTEGER AS stories,
      (SELECT COUNT(*) FROM characters)::INTEGER AS characters,
      (SELECT COUNT(*) FROM locations)::INTEGER AS locations,
      (SELECT COUNT(*) FROM world_rules)::INTEGER AS world_rules,
      (SELECT COUNT(*) FROM relationships)::INTEGER AS relationships,
      (SELECT COUNT(*) FROM story_assets WHERE saved_to_story_bible = TRUE)::INTEGER AS saved_assets
  `);
  const stories = Number(stats.stories || 0);
  const entityTotal =
    Number(stats.characters || 0) +
    Number(stats.locations || 0) +
    Number(stats.world_rules || 0) +
    Number(stats.relationships || 0) +
    Number(stats.saved_assets || 0);
  const targetPerStory = 8;

  return {
    score: stories ? clamp((entityTotal / (stories * targetPerStory)) * 100) : 0,
    stories,
    characters: Number(stats.characters || 0),
    locations: Number(stats.locations || 0),
    worldRules: Number(stats.world_rules || 0),
    relationships: Number(stats.relationships || 0),
    savedAssets: Number(stats.saved_assets || 0),
    entries: entityTotal,
  };
};

const getAgentResponseMetrics = async () => {
  const stats = await getOne(`
    SELECT
      COUNT(*)::INTEGER AS operations,
      COALESCE(AVG(duration), 0)::NUMERIC(10, 2) AS average_duration,
      COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration), 0)::NUMERIC(10, 2) AS p95_duration
    FROM agent_logs
    WHERE timestamp >= NOW() - INTERVAL '10 days'
      AND agent_name IN (
        'Story Bible Agent',
        'Research Agent',
        'Continuity Agent',
        'Scene Generation Agent',
        'Graph Agent',
        'Evaluation Agent'
      );
  `);

  return {
    operations: Number(stats.operations || 0),
    averageDuration: round(stats.average_duration),
    p95Duration: round(stats.p95_duration),
  };
};

const getRetrievalMetrics = async () => {
  const evaluationStats = await getOne(`
    SELECT COALESCE(AVG(retrieval_latency), 0)::NUMERIC(10, 2) AS average_retrieval
    FROM evaluation_results;
  `);
  const continuityStats = await getOne(`
    SELECT COALESCE(AVG(scan_time_ms), 0)::NUMERIC(10, 2) AS average_scan
    FROM continuity_checks;
  `);
  const retrieval = Number(evaluationStats.average_retrieval || 0);
  const scan = Number(continuityStats.average_scan || 0);

  return {
    averageRetrieval: round(retrieval),
    averageScanTime: round(scan),
    retrievalScore: retrieval ? clamp(100 - retrieval) : 0,
  };
};

const getResearchAgentMetrics = async () => {
  const stats = await getOne(`
    SELECT
      (SELECT COUNT(*) FROM research_entries)::INTEGER AS queries,
      (SELECT COUNT(*) FROM research_sources)::INTEGER AS sources,
      (SELECT COUNT(*) FROM contextual_nodes)::INTEGER AS contextual_nodes,
      (SELECT COALESCE(AVG(duration), 0) FROM agent_logs WHERE agent_name = 'Research Agent')::NUMERIC(10, 2) AS average_duration
  `);

  return {
    queries: Number(stats.queries || 0),
    sources: Number(stats.sources || 0),
    contextualNodes: Number(stats.contextual_nodes || 0),
    averageDuration: round(stats.average_duration),
  };
};

const getSceneGenerationMetrics = async () => {
  const stats = await getOne(`
    SELECT
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE generated_scene IS NOT NULL)::INTEGER AS expanded,
      COALESCE(AVG(confidence) FILTER (WHERE confidence IS NOT NULL), 0)::NUMERIC(10, 2) AS average_confidence,
      COALESCE(AVG(narrative_score) FILTER (WHERE narrative_score IS NOT NULL), 0)::NUMERIC(10, 2) AS average_score
    FROM generated_scenes;
  `);
  const logStats = await getOne(`
    SELECT COALESCE(AVG(duration), 0)::NUMERIC(10, 2) AS average_duration
    FROM agent_logs
    WHERE agent_name = 'Scene Generation Agent';
  `);

  return {
    total: Number(stats.total || 0),
    expanded: Number(stats.expanded || 0),
    averageConfidence: round(stats.average_confidence),
    averageNarrativeScore: round(stats.average_score),
    averageDuration: round(logStats.average_duration),
  };
};

const getKnowledgeGraphMetrics = async () => {
  const stats = await getOne(`
    SELECT
      (SELECT COUNT(*) FROM contextual_nodes)::INTEGER AS contextual_nodes,
      (SELECT COUNT(*) FROM relationships)::INTEGER AS relationships,
      (SELECT COUNT(*) FROM characters)::INTEGER AS characters,
      (SELECT COUNT(*) FROM locations)::INTEGER AS locations,
      (SELECT COUNT(*) FROM world_rules)::INTEGER AS world_rules,
      (SELECT COUNT(*) FROM research_entries)::INTEGER AS research_topics,
      (SELECT COALESCE(AVG(duration), 0) FROM agent_logs WHERE agent_name = 'Graph Agent')::NUMERIC(10, 2) AS average_duration
  `);
  const nodes =
    Number(stats.contextual_nodes || 0) +
    Number(stats.characters || 0) +
    Number(stats.locations || 0) +
    Number(stats.world_rules || 0) +
    Number(stats.research_topics || 0);

  return {
    nodes,
    contextualNodes: Number(stats.contextual_nodes || 0),
    relationships: Number(stats.relationships || 0),
    characters: Number(stats.characters || 0),
    locations: Number(stats.locations || 0),
    worldRules: Number(stats.world_rules || 0),
    researchTopics: Number(stats.research_topics || 0),
    averageDuration: round(stats.average_duration),
  };
};

export const getPocDashboard = async () => {
  const [
    continuity,
    storyBible,
    aiResponse,
    retrieval,
    research,
    scenes,
    graph,
    activity,
  ] = await Promise.all([
    getContinuityMetrics(),
    getStoryBibleCoverage(),
    getAgentResponseMetrics(),
    getRetrievalMetrics(),
    getResearchAgentMetrics(),
    getSceneGenerationMetrics(),
    getKnowledgeGraphMetrics(),
    getRecentActivity(),
  ]);

  const narrativeIntegrity = clamp(
    continuity.accuracy * 0.35 +
      storyBible.score * 0.25 +
      (scenes.averageConfidence || scenes.averageNarrativeScore || 0) * 0.2 +
      retrieval.retrievalScore * 0.1 +
      percentage(graph.relationships, Math.max(graph.nodes, 1)) * 0.1
  );

  return {
    generatedAt: new Date().toISOString(),
    primaryMetrics: [
      metric({
        label: 'Continuity Accuracy',
        value: continuity.accuracy,
        unit: '%',
        description: `${continuity.totalChecks} continuity checks, ${continuity.contradictions} contradictions found.`,
        trend: continuity.accuracy >= 80 ? 'positive' : 'warning',
      }),
      metric({
        label: 'Story Bible Coverage',
        value: storyBible.score,
        unit: '%',
        description: `${storyBible.entries} persisted entities across ${storyBible.stories} stories.`,
        trend: storyBible.score >= 60 ? 'positive' : 'warning',
      }),
      metric({
        label: 'AI Response Time',
        value: aiResponse.averageDuration,
        unit: 'ms',
        description: `${aiResponse.operations} logged AI operations in the last 10 days.`,
        trend: aiResponse.averageDuration <= 1500 ? 'positive' : 'warning',
      }),
      metric({
        label: 'ChromaDB Retrieval Speed',
        value: retrieval.averageRetrieval,
        unit: 'ms',
        description: `Average retrieval latency from persisted evaluation retrievals.`,
        trend: retrieval.averageRetrieval <= 100 ? 'positive' : 'warning',
      }),
      metric({
        label: 'Narrative Integrity Score',
        value: narrativeIntegrity,
        unit: '%',
        description: 'Weighted blend of continuity, coverage, scene confidence, retrieval, and graph density.',
        trend: narrativeIntegrity >= 75 ? 'positive' : 'warning',
      }),
    ],
    sections: {
      continuity,
      storyBible,
      aiResponse,
      retrieval,
      research,
      scenes,
      graph,
    },
    activity,
  };
};
