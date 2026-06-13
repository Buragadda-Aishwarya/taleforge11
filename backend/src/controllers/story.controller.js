import {
  generateStoryBibleFromText,
  uploadStoryWithIngestion,
} from '../services/story.service.js';
import { withAgentLog } from '../services/agentLog.service.js';

export const uploadStory = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (typeof title !== 'string' || title.trim().length === 0) {
      const error = new Error('Story title is required.');
      error.statusCode = 400;
      throw error;
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      const error = new Error('Story content is required.');
      error.statusCode = 400;
      throw error;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const result = await withAgentLog(
      {
        agentName: 'Story Bible Agent',
        action: `Upload and generate Story Bible: ${trimmedTitle}`,
        metadata: {
          provider: 'Gemini',
          route: 'story_bible',
        },
      },
      () => uploadStoryWithIngestion({
        title: trimmedTitle,
        content: trimmedContent,
      })
    );

    res.status(201).json({
      message: 'Story uploaded and indexed successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateBible = async (req, res, next) => {
  try {
    const storyContent = req.body.storyContent || req.body.content || req.body.text;

    if (typeof storyContent !== 'string' || storyContent.trim().length === 0) {
      const error = new Error('Story content is required.');
      error.statusCode = 400;
      throw error;
    }

    const storyBible = await withAgentLog(
      {
        agentName: 'Story Bible Agent',
        action: 'Generate Story Bible from raw text',
        metadata: {
          provider: 'Gemini',
          route: 'story_bible',
        },
      },
      () => generateStoryBibleFromText(storyContent)
    );

    res.status(200).json({
      message: 'Story bible generated successfully.',
      storyBible,
    });
  } catch (error) {
    next(error);
  }
};
