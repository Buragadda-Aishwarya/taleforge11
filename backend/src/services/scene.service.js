import { query } from '../config/db.js';
import { searchMemory, searchRelevantContext } from './chroma.service.js';
import { generateScenePaths } from './openai/sceneGeneration.service.js';

const emptyStoryBible = {
  story: null,
  characters: [],
  locations: [],
  worldRules: [],
};

const getStoryBible = async (storyId) => {
  const storyResult = await query(
    'SELECT id, title, content, created_at, updated_at FROM stories WHERE id = $1',
    [storyId]
  );

  if (!storyResult.rows[0]) {
    const error = new Error('Story not found.');
    error.statusCode = 404;
    throw error;
  }

  const [charactersResult, locationsResult, worldRulesResult] = await Promise.all([
    query(
      'SELECT id, name, description FROM characters WHERE story_id = $1 ORDER BY id ASC',
      [storyId]
    ),
    query(
      'SELECT id, name, description FROM locations WHERE story_id = $1 ORDER BY id ASC',
      [storyId]
    ),
    query(
      'SELECT id, rule, category FROM world_rules WHERE story_id = $1 OR story_id IS NULL ORDER BY id ASC',
      [storyId]
    ),
  ]);

  return {
    story: storyResult.rows[0],
    characters: charactersResult.rows,
    locations: locationsResult.rows,
    worldRules: worldRulesResult.rows,
  };
};

const retrieveSceneContext = async (storyBible) => {
  const queries = [
    `character facts ${storyBible.story?.title || ''}`,
    `world rules ${storyBible.story?.title || ''}`,
    `previous chapters ${storyBible.story?.title || ''}`,
    `research entries ${storyBible.story?.title || ''}`,
  ];
  const results = [];

  for (const contextQuery of queries) {
    try {
      const memoryResults = await searchMemory(contextQuery);
      results.push(
        ...memoryResults.map((item) => ({
          ...item,
          sourceQuery: contextQuery,
          sourceCollection: 'story_memory',
        }))
      );
    } catch (error) {
      console.warn(`Chroma memory retrieval failed for "${contextQuery}".`);
      console.warn(error.message || error);
    }
  }

  try {
    const storyResults = await searchRelevantContext(storyBible.story?.content || storyBible.story?.title || '');
    results.push(
      ...storyResults.map((item) => ({
        ...item,
        text: item.content,
        sourceQuery: 'previous chapters',
        sourceCollection: 'stories',
      }))
    );
  } catch (error) {
    console.warn('Chroma story context retrieval failed.');
    console.warn(error.message || error);
  }

  return results.slice(0, 20);
};

export const generateSceneForStory = async (storyId) => {
  if (!storyId) {
    const error = new Error('Story ID is required.');
    error.statusCode = 400;
    throw error;
  }

  let storyBible = emptyStoryBible;

  try {
    storyBible = await getStoryBible(storyId);
  } catch (error) {
    if (error.statusCode === 404) {
      throw error;
    }

    console.warn('PostgreSQL story bible retrieval failed. Using empty Story Bible.');
    console.warn(error.message || error);
  }

  const retrievedContext = await retrieveSceneContext(storyBible);
  const sceneGeneration = await generateScenePaths({
    storyBible,
    retrievedContext,
  });

  return {
    storyId,
    storyBible,
    retrievedContext,
    ...sceneGeneration,
  };
};
