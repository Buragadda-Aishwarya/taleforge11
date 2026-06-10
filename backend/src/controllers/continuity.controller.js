import { checkContinuity } from '../services/continuity.service.js';

export const checkSceneContinuity = async (req, res, next) => {
  try {
    const { scene, knownFacts } = req.body;
    const result = await checkContinuity(scene, knownFacts);

    res.status(200).json({
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
