import { Router } from 'express';
import {
  checkSceneContinuity,
  getContinuityChecks,
  patchContinuityCheck,
} from '../controllers/continuity.controller.js';

const router = Router();

router.post('/check', checkSceneContinuity);
router.get('/', getContinuityChecks);
router.patch('/:id', patchContinuityCheck);

export default router;
