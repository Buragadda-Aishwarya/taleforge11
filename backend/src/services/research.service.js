import { runGroqResearch } from './groq/research.service.js';
import { saveResearchToStoryBible } from './storyBible.service.js';

export const queryResearchAgent = async (researchQuery) => runGroqResearch(researchQuery);

export const addResearchToStoryBible = async ({ storyId, research }) =>
  saveResearchToStoryBible({ storyId, research });
