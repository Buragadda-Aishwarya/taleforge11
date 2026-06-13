import { routeAgentTask } from '../services/agents/agentRouter.service.js';
import {
  listContinuityChecks,
  updateContinuityCheckStatus,
} from '../services/continuity.service.js';

export const checkSceneContinuity = async (req, res, next) => {
  try {
    const { scene, knownFacts, storyId } = req.body;
    const result = await routeAgentTask({
      type: 'continuity',
      payload: { scene, knownFacts, storyId },
    });

    res.status(200).json({
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getContinuityChecks = async (req, res, next) => {
  try {
    const checks = await listContinuityChecks({
      status: req.query.status || 'history',
      limit: req.query.limit,
    });

    res.status(200).json({ checks });
  } catch (error) {
    next(error);
  }
};

export const patchContinuityCheck = async (req, res, next) => {
  try {
    const check = await updateContinuityCheckStatus(req.params.id, req.body.status);

    res.status(200).json({
      message: 'Continuity check updated.',
      check,
    });
  } catch (error) {
    next(error);
  }
};
