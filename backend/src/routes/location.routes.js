import { Router } from 'express';
import { postLocation } from '../controllers/storyBible.controller.js';

const router = Router();

router.post('/', postLocation);

export default router;
