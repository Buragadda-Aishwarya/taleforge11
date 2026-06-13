import { routeAgentTask } from '../services/agents/agentRouter.service.js';
import { expandSceneForStory } from '../services/scene.service.js';

export const generateScene = async (req, res, next) => {
  try {
    const { storyId, provider } = req.body;
    const result = await routeAgentTask({
      type: 'scene',
      payload: { storyId, provider },
    });

    res.status(200).json({
      message: 'Scene paths generated.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const expandScene = async (req, res, next) => {
  try {
    const { storyId, selectedPath, provider } = req.body;
    const result = await expandSceneForStory({ storyId, selectedPath, provider });

    res.status(200).json({
      message: 'Scene expanded and continuity validated.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
