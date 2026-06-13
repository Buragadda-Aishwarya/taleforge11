import {
  getEvaluationTests,
  getLatestEvaluationMetrics,
  runEvaluationBenchmarks,
} from '../services/evaluation.service.js';
import { withAgentLog } from '../services/agentLog.service.js';
import { getPocDashboard } from '../services/pocDashboard.service.js';

export const runEvaluation = async (_req, res, next) => {
  try {
    const evaluation = await withAgentLog(
      {
        agentName: 'Evaluation Agent',
        action: 'Run benchmark suite',
        metadata: {
          provider: 'Internal',
          route: 'evaluation',
        },
      },
      () => runEvaluationBenchmarks()
    );

    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
};

export const getEvaluationMetrics = async (_req, res, next) => {
  try {
    const evaluation = await getLatestEvaluationMetrics();

    res.status(200).json({ evaluation });
  } catch (error) {
    next(error);
  }
};

export const listEvaluationTests = async (_req, res, next) => {
  try {
    const tests = await getEvaluationTests();

    res.status(200).json({ tests });
  } catch (error) {
    next(error);
  }
};

export const getPocDashboardMetrics = async (_req, res, next) => {
  try {
    const dashboard = await getPocDashboard();

    res.status(200).json({ dashboard });
  } catch (error) {
    next(error);
  }
};
