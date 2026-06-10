import { Router } from 'express';
import { checkSceneContinuity } from '../controllers/continuity.controller.js';

const router = Router();

router.post('/check', checkSceneContinuity);

export default router;
