import { Router } from 'express';
import {
  addResearch,
  queryResearch,
} from '../controllers/research.controller.js';

const router = Router();

router.post('/query', queryResearch);
router.post('/add-to-story-bible', addResearch);

export default router;
