import { Router } from 'express';
import {
  generateBible,
  uploadStory,
} from '../controllers/story.controller.js';

const router = Router();

router.post('/upload', uploadStory);
router.post('/generate-bible', generateBible);

export default router;
