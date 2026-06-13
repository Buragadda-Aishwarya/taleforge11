import { Router } from 'express';
import { getGraphByStory } from '../controllers/graph.controller.js';

const router = Router();

router.get('/story/:storyId', getGraphByStory);

export default router;
