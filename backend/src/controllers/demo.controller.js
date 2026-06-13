import {
  listDemoStories,
  runRecruiterDemo,
} from '../services/demo.service.js';

export const getDemoStories = async (_req, res, next) => {
  try {
    const stories = await listDemoStories();
    res.status(200).json({ stories });
  } catch (error) {
    next(error);
  }
};

export const runDemo = async (req, res, next) => {
  try {
    const result = await runRecruiterDemo(req.body?.demoId);
    res.status(200).json({
      message: 'Recruiter demo completed.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
