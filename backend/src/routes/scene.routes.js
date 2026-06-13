import { Router } from 'express';
import {
  expandScene,
  generateScene,
} from '../controllers/scene.controller.js';

const router = Router();

router.post('/generate', generateScene);
router.post('/expand', expandScene);

export default router;
