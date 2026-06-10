import {
  addResearchToStoryBible,
  queryResearchAgent,
} from '../services/research.service.js';

export const queryResearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    const research = await queryResearchAgent(query);

    res.status(200).json({
      message: 'Research query completed.',
      research,
    });
  } catch (error) {
    next(error);
  }
};

export const addResearch = async (req, res, next) => {
  try {
    const { storyId, research } = req.body;
    const result = await addResearchToStoryBible({ storyId, research });

    res.status(201).json({
      message: 'Research added to Story Bible.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
