import {
  createCharacter,
  createLocation,
  createWorldRule,
} from '../services/storyBible.service.js';

export const postCharacter = async (req, res, next) => {
  try {
    const character = await createCharacter({
      storyId: req.body.storyId,
      character: req.body.character || req.body,
    });
    res.status(201).json({ message: 'Character created.', character });
  } catch (error) {
    next(error);
  }
};

export const postWorldRule = async (req, res, next) => {
  try {
    const worldRule = await createWorldRule({
      storyId: req.body.storyId,
      worldRule: req.body.worldRule || req.body,
    });
    res.status(201).json({ message: 'World rule created.', worldRule });
  } catch (error) {
    next(error);
  }
};

export const postLocation = async (req, res, next) => {
  try {
    const location = await createLocation({
      storyId: req.body.storyId,
      location: req.body.location || req.body,
    });
    res.status(201).json({ message: 'Location created.', location });
  } catch (error) {
    next(error);
  }
};
