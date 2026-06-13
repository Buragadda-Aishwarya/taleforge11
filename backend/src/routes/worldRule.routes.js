import { Router } from 'express';
import { postWorldRule } from '../controllers/storyBible.controller.js';

const router = Router();

router.post('/', postWorldRule);

export default router;
