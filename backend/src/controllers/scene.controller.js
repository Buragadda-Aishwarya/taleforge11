import { generateSceneForStory } from '../services/scene.service.js';

export const generateScene = async (req, res, next) => {
  try {
    const { storyId } = req.body;
    const result = await generateSceneForStory(storyId);

    res.status(200).json({
      message: 'Scene paths generated.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
