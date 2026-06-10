import { runGeminiResearch } from './gemini/research.service.js';
import { query } from '../config/db.js';
import { addMemory } from './chroma.service.js';

export const queryResearchAgent = async (researchQuery) => {
  const research = await runGeminiResearch(researchQuery);

  return {
    query: researchQuery.trim(),
    ...research,
  };
};

const normalizeResearchPayload = (research) => ({
  query: research?.query || 'Research Entry',
  summary: research?.summary || '',
  keyFindings: Array.isArray(research?.keyFindings) ? research.keyFindings : [],
  storyIdeas: Array.isArray(research?.storyIdeas) ? research.storyIdeas : [],
  characterIdeas: Array.isArray(research?.characterIdeas) ? research.characterIdeas : [],
  worldBuildingIdeas: Array.isArray(research?.worldBuildingIdeas) ? research.worldBuildingIdeas : [],
});

const saveResearchCharacters = async ({ storyId, research }) => {
  const saved = [];

  for (const idea of research.characterIdeas) {
    const result = await query(
      `
        INSERT INTO characters (story_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, story_id, name, description, created_at, updated_at;
      `,
      [storyId || null, idea.slice(0, 120), idea]
    );

    saved.push(result.rows[0]);
  }

  return saved;
};

const saveResearchWorldRules = async ({ storyId, research }) => {
  const ruleTexts = [
    ...research.worldBuildingIdeas,
    ...research.storyIdeas.map((idea) => `Story idea: ${idea}`),
    ...research.keyFindings.map((finding) => `Research finding: ${finding}`),
  ];
  const saved = [];

  for (const ruleText of ruleTexts) {
    const result = await query(
      `
        INSERT INTO world_rules (story_id, rule, category)
        VALUES ($1, $2, $3)
        RETURNING id, story_id, rule, category, created_at, updated_at;
      `,
      [storyId || null, ruleText, 'Research']
    );

    saved.push(result.rows[0]);
  }

  return saved;
};

const saveResearchToChroma = async ({ storyId, research, savedCharacters, savedWorldRules }) => {
  const memoryResults = [];
  const entries = [
    ...savedWorldRules.map((rule) => ({
      id: `research:world-rule:${rule.id}`,
      text: rule.rule,
      metadata: {
        type: 'world_rule',
        source: 'research',
        storyId: storyId || '',
        category: rule.category || 'Research',
      },
    })),
    ...savedCharacters.map((character) => ({
      id: `research:character:${character.id}`,
      text: character.description || character.name,
      metadata: {
        type: 'character',
        source: 'research',
        storyId: storyId || '',
        characterName: character.name,
      },
    })),
    {
      id: `research:summary:${Date.now()}`,
      text: research.summary,
      metadata: {
        type: 'research_summary',
        source: 'research',
        storyId: storyId || '',
        query: research.query,
      },
    },
  ].filter((entry) => entry.text);

  for (const entry of entries) {
    memoryResults.push(await addMemory(entry.id, entry.text, entry.metadata));
  }

  return memoryResults;
};

export const addResearchToStoryBible = async ({ storyId, research }) => {
  const normalizedResearch = normalizeResearchPayload(research);
  let savedCharacters = [];
  let savedWorldRules = [];
  let memoryEntries = [];
  const warnings = [];

  try {
    savedCharacters = await saveResearchCharacters({
      storyId,
      research: normalizedResearch,
    });
    savedWorldRules = await saveResearchWorldRules({
      storyId,
      research: normalizedResearch,
    });
  } catch (error) {
    warnings.push(`PostgreSQL save failed: ${error.message || error}`);
  }

  try {
    memoryEntries = await saveResearchToChroma({
      storyId,
      research: normalizedResearch,
      savedCharacters,
      savedWorldRules,
    });
  } catch (error) {
    warnings.push(`Chroma memory save failed: ${error.message || error}`);
  }

  return {
    storyId: storyId || null,
    characters: savedCharacters,
    worldRules: savedWorldRules,
    memoryEntries,
    warnings,
  };
};
