import { Router } from 'express';
import {
  getDemoStories,
  runDemo,
} from '../controllers/demo.controller.js';

const router = Router();

router.get('/stories', getDemoStories);
router.post('/run', runDemo);

export default router;
