import { Router } from 'express';
import { testDatabase } from '../controllers/db.controller.js';

const router = Router();

router.get('/db-test', testDatabase);

export default router;
