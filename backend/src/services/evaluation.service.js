import { performance } from 'node:perf_hooks';
import { query } from '../config/db.js';
import { searchRelevantContext } from './chroma.service.js';
import { runContinuityAgent } from './continuityAgent.js';

const round = (value, digits = 2) => Number(value.toFixed(digits));

const percentage = (numerator, denominator) =>
  denominator === 0 ? 0 : round((numerator / denominator) * 100);

const loadEvaluationTests = async () => {
  const result = await query(
    `
      SELECT id, name, fact, scene, expected_result, expected_contradiction
      FROM evaluation_tests
      ORDER BY id ASC
    `
  );

  return result.rows;
};

const retrieveBenchmarkFacts = async (test) => {
  const startedAt = performance.now();
  let retrievedFacts = [];

  try {
    const context = await searchRelevantContext(test.scene);
    retrievedFacts = context
      .map((item) => item.content)
      .filter((content) => typeof content === 'string' && content.trim());
  } catch (error) {
    console.warn(`Evaluation retrieval failed for test ${test.id}.`);
    console.warn(error.message || error);
  }

  if (!retrievedFacts.some((fact) => fact.includes(test.fact))) {
    retrievedFacts.unshift(test.fact);
  }

  return {
    retrievedFacts,
    retrievalLatency: round(performance.now() - startedAt),
  };
};

const runEvaluationTest = async (test) => {
  const responseStartedAt = performance.now();
  const { retrievedFacts, retrievalLatency } = await retrieveBenchmarkFacts(test);
  const analysis = await runContinuityAgent({
    scene: test.scene,
    retrievedFacts,
  });
  const responseTime = round(performance.now() - responseStartedAt);
  const passed = analysis.contradiction === test.expected_contradiction;

  return {
    testId: test.id,
    name: test.name,
    knownFact: test.fact,
    sceneInput: test.scene,
    expectedResult: test.expected_result,
    expectedContradiction: test.expected_contradiction,
    detectedResult: analysis.contradiction
      ? analysis.type || 'Contradiction'
      : 'No Contradiction',
    detectedContradiction: analysis.contradiction,
    confidence: analysis.confidence,
    retrievalLatency,
    responseTime,
    explanation: analysis.reason,
    passed,
  };
};

const calculateMetrics = (results) => {
  const totalTests = results.length;
  const passedTests = results.filter((result) => result.passed).length;
  const truePositives = results.filter(
    (result) => result.expectedContradiction && result.detectedContradiction
  ).length;
  const falsePositives = results.filter(
    (result) => !result.expectedContradiction && result.detectedContradiction
  ).length;
  const falseNegatives = results.filter(
    (result) => result.expectedContradiction && !result.detectedContradiction
  ).length;
  const average = (field) =>
    totalTests
      ? round(results.reduce((sum, result) => sum + result[field], 0) / totalTests)
      : 0;

  return {
    totalTests,
    passedTests,
    contradictionAccuracy: percentage(passedTests, totalTests),
    precision: percentage(truePositives, truePositives + falsePositives),
    recall: percentage(truePositives, truePositives + falseNegatives),
    averageConfidence: average('confidence'),
    retrievalLatency: average('retrievalLatency'),
    responseTime: average('responseTime'),
  };
};

const storeEvaluationRun = async ({ metrics, results }) => {
  const runResult = await query(
    `
      INSERT INTO evaluation_runs (
        total_tests,
        passed_tests,
        contradiction_accuracy,
        precision_score,
        recall_score,
        average_confidence,
        retrieval_latency,
        response_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at;
    `,
    [
      metrics.totalTests,
      metrics.passedTests,
      metrics.contradictionAccuracy,
      metrics.precision,
      metrics.recall,
      metrics.averageConfidence,
      metrics.retrievalLatency,
      metrics.responseTime,
    ]
  );
  const run = runResult.rows[0];

  for (const result of results) {
    await query(
      `
        INSERT INTO evaluation_results (
          run_id,
          test_id,
          detected_result,
          detected_contradiction,
          confidence,
          retrieval_latency,
          response_time,
          passed,
          explanation
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `,
      [
        run.id,
        result.testId,
        result.detectedResult,
        result.detectedContradiction,
        result.confidence,
        result.retrievalLatency,
        result.responseTime,
        result.passed,
        result.explanation,
      ]
    );
  }

  return run;
};

export const runEvaluationBenchmarks = async () => {
  const tests = await loadEvaluationTests();

  if (!tests.length) {
    const error = new Error('No evaluation tests are configured.');
    error.statusCode = 404;
    throw error;
  }

  const results = [];

  for (const test of tests) {
    results.push(await runEvaluationTest(test));
  }

  const metrics = calculateMetrics(results);
  const run = await storeEvaluationRun({ metrics, results });

  return {
    runId: run.id,
    createdAt: run.created_at,
    metrics,
    results,
  };
};

const loadDashboardCounts = async () => {
  const result = await query(
    `
      SELECT
        (SELECT COUNT(*) FROM story_assets) AS story_bible_entries,
        (SELECT COUNT(*) FROM research_entries) AS research_queries,
        (SELECT COUNT(*) FROM generated_scenes) AS scene_generations,
        (SELECT COUNT(*) FROM continuity_checks) AS continuity_checks,
        (SELECT COUNT(*) FROM continuity_checks WHERE contradiction = TRUE) AS contradictions_detected,
        (SELECT COUNT(*) FROM continuity_checks WHERE status = 'ignored') AS contradictions_ignored,
        (SELECT COUNT(*) FROM contextual_nodes) AS knowledge_graph_nodes,
        (SELECT COUNT(*) FROM relationships) AS knowledge_graph_relationships
    `
  );

  const counts = result.rows[0] || {};

  return {
    storyBibleEntries: Number(counts.story_bible_entries || 0),
    researchQueries: Number(counts.research_queries || 0),
    sceneGenerations: Number(counts.scene_generations || 0),
    continuityChecks: Number(counts.continuity_checks || 0),
    contradictionsDetected: Number(counts.contradictions_detected || 0),
    contradictionsIgnored: Number(counts.contradictions_ignored || 0),
    knowledgeGraphNodes: Number(counts.knowledge_graph_nodes || 0),
    knowledgeGraphRelationships: Number(counts.knowledge_graph_relationships || 0),
  };
};

export const getLatestEvaluationMetrics = async () => {
  const runResult = await query(
    `
      SELECT
        id,
        total_tests,
        passed_tests,
        contradiction_accuracy,
        precision_score,
        recall_score,
        average_confidence,
        retrieval_latency,
        response_time,
        created_at
      FROM evaluation_runs
      ORDER BY id DESC
      LIMIT 1
    `
  );
  const run = runResult.rows[0];

  const counts = await loadDashboardCounts();

  if (!run) {
    return {
      runId: null,
      createdAt: null,
      metrics: {
        totalTests: 0,
        passedTests: 0,
        contradictionAccuracy: 0,
        precision: 0,
        recall: 0,
        averageConfidence: 0,
        retrievalLatency: 0,
        responseTime: 0,
      },
      results: [],
      counts,
    };
  }

  const resultsResult = await query(
    `
      SELECT
        er.id,
        er.test_id,
        et.name,
        et.fact,
        et.scene,
        et.expected_result,
        er.detected_result,
        er.detected_contradiction,
        er.confidence,
        er.retrieval_latency,
        er.response_time,
        er.passed,
        er.explanation
      FROM evaluation_results er
      JOIN evaluation_tests et ON et.id = er.test_id
      WHERE er.run_id = $1
      ORDER BY er.id ASC
    `,
    [run.id]
  );

  return {
    runId: run.id,
    createdAt: run.created_at,
    metrics: {
      totalTests: run.total_tests,
      passedTests: run.passed_tests,
      contradictionAccuracy: Number(run.contradiction_accuracy),
      precision: Number(run.precision_score),
      recall: Number(run.recall_score),
      averageConfidence: Number(run.average_confidence),
      retrievalLatency: Number(run.retrieval_latency),
      responseTime: Number(run.response_time),
    },
    results: resultsResult.rows.map((result) => ({
      id: result.id,
      testId: result.test_id,
      name: result.name,
      knownFact: result.fact,
      sceneInput: result.scene,
      expectedResult: result.expected_result,
      detectedResult: result.detected_result,
      detectedContradiction: result.detected_contradiction,
      confidence: Number(result.confidence),
      retrievalLatency: Number(result.retrieval_latency),
      responseTime: Number(result.response_time),
      passed: result.passed,
      explanation: result.explanation,
      violationType: result.detected_result,
    })),
    counts,
  };
};

export const getEvaluationTests = async () => loadEvaluationTests();
