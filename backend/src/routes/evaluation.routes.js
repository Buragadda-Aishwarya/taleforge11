import { Router } from 'express';
import {
  getPocDashboardMetrics,
  getEvaluationMetrics,
  listEvaluationTests,
  runEvaluation,
} from '../controllers/evaluation.controller.js';

const router = Router();

router.get('/metrics', getEvaluationMetrics);
router.get('/dashboard', getPocDashboardMetrics);
router.get('/tests', listEvaluationTests);
router.post('/run', runEvaluation);

export default router;
