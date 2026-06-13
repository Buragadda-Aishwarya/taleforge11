import { Router } from 'express';
import {
  clearAgentHistory,
  getAgentLogs,
  removeAgentLog,
} from '../controllers/agent.controller.js';

const router = Router();

router.get('/logs', getAgentLogs);
router.delete('/logs', clearAgentHistory);
router.delete('/logs/:id', removeAgentLog);

export default router;
