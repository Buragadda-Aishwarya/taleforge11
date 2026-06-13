import { query } from '../config/db.js';

export const insertScenePath = async ({
  storyId,
  pathTitle,
  pathSummary,
  impact,
  riskLevel,
  narrativeScore,
  prompt = 'Generate next narrative path',
}) => {
  const result = await query(
    `
      INSERT INTO generated_scenes (
        story_id,
        prompt,
        path_title,
        path_summary,
        impact,
        risk_level,
        narrative_score,
        validation_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, story_id, path_title, path_summary, impact, risk_level,
        narrative_score, generated_scene, confidence, validation_status, created_at;
    `,
    [
      storyId,
      prompt,
      pathTitle,
      pathSummary,
      impact,
      riskLevel,
      narrativeScore,
      'path_generated',
    ]
  );

  return result.rows[0];
};

export const updateSceneExpansion = async ({
  storyId,
  selectedPath,
  generatedScene,
  confidence,
  validationStatus = 'validated',
}) => {
  const result = await query(
    `
      INSERT INTO generated_scenes (
        story_id,
        prompt,
        path_title,
        selected_path,
        generated_scene,
        confidence,
        validation_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, story_id, path_title, selected_path, generated_scene,
        confidence, validation_status, created_at;
    `,
    [
      storyId,
      'Expand selected narrative path',
      selectedPath,
      selectedPath,
      generatedScene,
      confidence,
      validationStatus,
    ]
  );

  return result.rows[0];
};

export const getLatestChapter = async (storyId) => {
  const generatedResult = await query(
    `
      SELECT generated_scene AS content, created_at
      FROM generated_scenes
      WHERE story_id = $1
        AND generated_scene IS NOT NULL
      ORDER BY created_at DESC, id DESC
      LIMIT 1;
    `,
    [storyId]
  );

  if (generatedResult.rows[0]?.content) {
    return generatedResult.rows[0];
  }

  const storyResult = await query(
    `
      SELECT content, created_at
      FROM stories
      WHERE id = $1
      LIMIT 1;
    `,
    [storyId]
  );

  return storyResult.rows[0] || null;
};

export const listGeneratedScenesForStory = async (storyId) => {
  const result = await query(
    `
      SELECT id, story_id, path_title, path_summary, impact, risk_level,
        narrative_score, selected_path, generated_scene, confidence,
        validation_status, created_at
      FROM generated_scenes
      WHERE story_id = $1
      ORDER BY created_at DESC, id DESC;
    `,
    [storyId]
  );

  return result.rows;
};
