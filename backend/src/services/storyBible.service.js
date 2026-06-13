import { query } from '../config/db.js';
import { addMemory } from './chroma.service.js';

const safeStoryId = (storyId) => {
  const parsed = Number.parseInt(storyId, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const remember = async ({ id, text, metadata, warnings }) => {
  try {
    return await addMemory(id, text, metadata);
  } catch (error) {
    warnings.push(`ChromaDB save failed for ${id}: ${error.message || error}`);
    return null;
  }
};

export const createCharacter = async ({ storyId, character }) => {
  const name = character?.name || 'Research Character';
  const description = [
    character?.description,
    character?.role ? `Role: ${character.role}` : '',
    character?.storyUse ? `Story use: ${character.storyUse}` : '',
  ].filter(Boolean).join(' ');
  const result = await query(
    `
      INSERT INTO characters (story_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, story_id, name, description, created_at, updated_at;
    `,
    [safeStoryId(storyId), name, description]
  );

  return result.rows[0];
};

export const createLocation = async ({ storyId, location }) => {
  const name = location?.name || 'Research Location';
  const description = [
    location?.description,
    location?.significance ? `Significance: ${location.significance}` : '',
  ].filter(Boolean).join(' ');
  const result = await query(
    `
      INSERT INTO locations (story_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, story_id, name, description, created_at, updated_at;
    `,
    [safeStoryId(storyId), name, description]
  );

  return result.rows[0];
};

export const createWorldRule = async ({ storyId, worldRule }) => {
  const ruleText = [
    worldRule?.rule || worldRule?.description || 'Research world rule',
    worldRule?.narrativeUse ? `Narrative use: ${worldRule.narrativeUse}` : '',
  ].filter(Boolean).join(' ');
  const result = await query(
    `
      INSERT INTO world_rules (story_id, rule, category)
      VALUES ($1, $2, $3)
      RETURNING id, story_id, rule, category, created_at, updated_at;
    `,
    [safeStoryId(storyId), ruleText, worldRule?.category || 'Research Rule']
  );

  return result.rows[0];
};

const createResearchEntry = async ({ storyId, research }) => {
  const result = await query(
    `
      INSERT INTO research_entries (
        story_id, query, summary, executive_summary, key_findings, technologies,
        challenges, opportunities, historical_evolution, story_opportunities,
        story_ideas, ai_ideation_drafts, contextual_nodes, sources
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `,
    [
      safeStoryId(storyId),
      research.query,
      research.summary || research.executiveSummary || '',
      research.executiveSummary || research.summary || '',
      JSON.stringify(research.keyFindings || []),
      JSON.stringify(research.technologies || []),
      JSON.stringify(research.challenges || []),
      JSON.stringify(research.opportunities || []),
      JSON.stringify(research.historicalEvolution || []),
      JSON.stringify(research.storyOpportunities || research.storyIdeas || []),
      JSON.stringify(research.storyIdeas || research.storyOpportunities || []),
      JSON.stringify(research.aiIdeationDrafts || {}),
      JSON.stringify(research.contextualNodes || []),
      JSON.stringify(research.sources || []),
    ]
  );

  return result.rows[0];
};

const saveSources = async ({ storyId, researchEntryId, sources = [] }) => {
  const saved = [];

  for (const source of sources) {
    const result = await query(
      `
        INSERT INTO research_sources (research_entry_id, story_id, title, category, trust_score, url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      [
        researchEntryId,
        safeStoryId(storyId),
        source.title || 'Untitled Source',
        source.category || 'Research Lead',
        Math.max(0, Math.min(100, Number.parseInt(source.trustScore, 10) || 70)),
        source.url || '',
      ]
    );
    saved.push(result.rows[0]);
  }

  return saved;
};

const saveContextualNodes = async ({ storyId, researchEntryId, nodes = [] }) => {
  const saved = [];

  for (const node of nodes) {
    const result = await query(
      `
        INSERT INTO contextual_nodes (research_entry_id, story_id, label, type, description, parent_label)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      [
        researchEntryId,
        safeStoryId(storyId),
        node.label || 'Context Node',
        node.type || 'Topic',
        node.description || '',
        node.parentLabel || '',
      ]
    );
    saved.push(result.rows[0]);
  }

  return saved;
};

const saveStoryAsset = async ({ storyId, researchEntryId, assetType, asset }) => {
  const name = asset?.name || asset?.title || asset?.rule || assetType;
  const description = asset?.description || asset?.narrativeUse || asset?.stakes || asset?.payoff || asset?.rule || '';
  const result = await query(
    `
      INSERT INTO story_assets (
        research_entry_id, story_id, asset_type, name, description, payload, saved_to_story_bible
      )
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING *;
    `,
    [
      researchEntryId,
      safeStoryId(storyId),
      assetType,
      name,
      description,
      JSON.stringify(asset || {}),
    ]
  );

  return result.rows[0];
};

const saveGeneratedAssets = async ({ storyId, researchEntryId, storyAssets = {} }) => {
  const saved = [];

  for (const [assetType, asset] of Object.entries(storyAssets)) {
    saved.push(await saveStoryAsset({ storyId, researchEntryId, assetType, asset }));
  }

  return saved;
};

export const saveResearchToStoryBible = async ({ storyId, research }) => {
  const warnings = [];
  const researchEntry = await createResearchEntry({ storyId, research });
  const [sources, contextualNodes, storyAssets] = await Promise.all([
    saveSources({ storyId, researchEntryId: researchEntry.id, sources: research.sources || [] }),
    saveContextualNodes({ storyId, researchEntryId: researchEntry.id, nodes: research.contextualNodes || [] }),
    saveGeneratedAssets({ storyId, researchEntryId: researchEntry.id, storyAssets: research.storyAssets || {} }),
  ]);

  const memoryPayloads = [
    {
      id: `research:entry:${researchEntry.id}`,
      text: [
        research.query,
        research.executiveSummary || research.summary,
        ...(research.keyFindings || []),
        ...(research.technologies || []),
        ...(research.storyOpportunities || []),
      ].filter(Boolean).join(' '),
      metadata: { type: 'research_entry', storyId: safeStoryId(storyId) || '', query: research.query },
    },
    ...contextualNodes.map((node) => ({
      id: `research:context-node:${node.id}`,
      text: `${node.label}: ${node.description || node.type || ''}`,
      metadata: { type: 'contextual_node', storyId: safeStoryId(storyId) || '', nodeType: node.type || 'Topic' },
    })),
    ...storyAssets.map((asset) => ({
      id: `research:asset:${asset.id}`,
      text: `${asset.asset_type}: ${asset.name}. ${asset.description || ''}`,
      metadata: { type: 'story_asset', storyId: safeStoryId(storyId) || '', assetType: asset.asset_type },
    })),
  ];

  const memoryEntries = [];
  for (const payload of memoryPayloads) {
    const memory = await remember({ ...payload, warnings });
    if (memory) memoryEntries.push(memory);
  }

  return {
    storyId: safeStoryId(storyId),
    researchEntry,
    sources,
    contextualNodes,
    storyAssets,
    memoryEntries,
    warnings,
  };
};
