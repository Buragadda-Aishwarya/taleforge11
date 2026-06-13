import { Router } from 'express';
import { postCharacter } from '../controllers/storyBible.controller.js';

const router = Router();

router.post('/', postCharacter);

export default router;
