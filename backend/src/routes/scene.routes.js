import { Router } from 'express';
import { generateScene } from '../controllers/scene.controller.js';

const router = Router();

router.post('/generate', generateScene);

export default router;
