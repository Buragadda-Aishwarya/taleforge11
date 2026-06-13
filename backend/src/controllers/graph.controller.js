import { routeAgentTask } from '../services/agents/agentRouter.service.js';

export const getGraphByStory = async (req, res, next) => {
  try {
    const graph = await routeAgentTask({
      type: 'graph',
      payload: { storyId: req.params.storyId },
    });

    res.status(200).json(graph);
  } catch (error) {
    next(error);
  }
};
