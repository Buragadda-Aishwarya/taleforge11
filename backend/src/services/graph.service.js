import { query } from '../config/db.js';

const NODE_STYLE = {
  Story: { type: 'lore', icon: 'Book', color: '#a855f7' },
  Character: { type: 'character', icon: 'User', color: '#22d3ee' },
  Location: { type: 'location', icon: 'Castle', color: '#38bdf8' },
  'World Rule': { type: 'lore', icon: 'Scale', color: '#f472b6' },
  Faction: { type: 'artifact', icon: 'Flag', color: '#facc15' },
  Object: { type: 'artifact', icon: 'Diamond', color: '#c084fc' },
  Event: { type: 'artifact', icon: 'Calendar', color: '#fb7185' },
  'Research Topic': { type: 'lore', icon: 'Search', color: '#facc15' },
  'Contextual Node': { type: 'artifact', icon: 'Network', color: '#34d399' },
  Conflict: { type: 'artifact', icon: 'AlertTriangle', color: '#ef4444' },
  Scene: { type: 'scene', icon: 'Route', color: '#60a5fa' },
};

const RELATION_COLORS = {
  Violates: '#ef4444',
  Contradicts: '#ef4444',
  'Research Inspired': '#facc15',
  'Connected To': '#34d399',
  'Appears In': '#60a5fa',
  Influences: '#a855f7',
  default: '#94a3b8',
};

const truncate = (value = '', maxLength = 180) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;

const slugify = (value) =>
  String(value || 'node')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'node';

const relationLabel = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  const map = {
    'lives in': 'Lives In',
    mentors: 'Mentored By',
    'mentored by': 'Mentored By',
    'belongs to': 'Belongs To',
    owns: 'Owns',
    created: 'Created By',
    'created by': 'Created By',
    located: 'Located In',
    'located in': 'Located In',
    enemy: 'Enemy Of',
    'enemy of': 'Enemy Of',
    ally: 'Ally Of',
    'ally of': 'Ally Of',
    violates: 'Violates',
    contradicts: 'Contradicts',
    depends: 'Depends On',
    'depends on': 'Depends On',
    influences: 'Influences',
    appears: 'Appears In',
    'appears in': 'Appears In',
    part: 'Part Of',
    'part of': 'Part Of',
  };

  return map[normalized] || value.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Connected To';
};

const makeNode = ({
  id,
  label,
  nodeType,
  description = '',
  source = 'PostgreSQL',
  createdAt = null,
  metadata = {},
}) => {
  const style = NODE_STYLE[nodeType] || NODE_STYLE.Object;

  return {
    id,
    type: style.type,
    position: { x: 0, y: 0 },
    data: {
      id,
      label: truncate(label, 64),
      fullLabel: label,
      type: nodeType,
      subtitle: nodeType,
      description: description || '',
      source,
      createdAt,
      lastUpdated: metadata.lastUpdated || createdAt,
      generatedBy: metadata.generatedBy || source,
      icon: style.icon,
      color: style.color,
      metadata,
      relationships: [],
      connectedNodes: [],
    },
  };
};

const makeEdge = ({
  id,
  source,
  target,
  relation,
  sourceType = 'PostgreSQL',
  animated = true,
}) => {
  const label = relationLabel(relation);
  const color = RELATION_COLORS[label] || RELATION_COLORS.default;

  return {
    id,
    source,
    target,
    type: 'narrative',
    label,
    animated,
    data: {
      relation: label,
      source: sourceType,
    },
    style: {
      stroke: color,
      strokeWidth: label === 'Violates' || label === 'Contradicts' ? 3 : 1.8,
    },
    markerEnd: {
      type: 'arrowclosed',
      color,
    },
  };
};

const applyLayout = (nodes) => {
  const groups = nodes.reduce((acc, node) => {
    const type = node.data.type;
    acc[type] = acc[type] || [];
    acc[type].push(node);
    return acc;
  }, {});
  const order = [
    'Story',
    'Character',
    'Location',
    'World Rule',
    'Faction',
    'Object',
    'Research Topic',
    'Contextual Node',
    'Scene',
    'Conflict',
    'Event',
  ];
  const center = { x: 640, y: 420 };
  const positioned = [];

  for (const [groupIndex, type] of order.entries()) {
    const group = groups[type] || [];
    if (!group.length) continue;
    const radius = type === 'Story' ? 0 : 220 + groupIndex * 58;
    const startAngle = (groupIndex * Math.PI) / 7;

    group.forEach((node, index) => {
      const angle = startAngle + (index / Math.max(group.length, 1)) * Math.PI * 2;
      positioned.push({
        ...node,
        position: type === 'Story'
          ? center
          : {
              x: Math.round(center.x + Math.cos(angle) * radius),
              y: Math.round(center.y + Math.sin(angle) * radius),
            },
      });
    });
  }

  return positioned;
};

const addNode = (map, node) => {
  if (!map.has(node.id)) {
    map.set(node.id, node);
  }
  return map.get(node.id);
};

const findNodeByLabel = (nodes, label) => {
  const normalized = String(label || '').toLowerCase().trim();
  if (!normalized) return null;
  return nodes.find((node) => {
    const nodeLabel = String(node.data.fullLabel || node.data.label).toLowerCase();
    return nodeLabel === normalized || nodeLabel.includes(normalized) || normalized.includes(nodeLabel);
  });
};

const hydrateRelationships = (nodes, edges) => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  for (const edge of edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) continue;

    source.data.relationships.push({
      relation: edge.label,
      direction: 'outgoing',
      nodeId: target.id,
      label: target.data.fullLabel || target.data.label,
    });
    target.data.relationships.push({
      relation: edge.label,
      direction: 'incoming',
      nodeId: source.id,
      label: source.data.fullLabel || source.data.label,
    });
    source.data.connectedNodes.push(target.id);
    target.data.connectedNodes.push(source.id);
  }

  return nodes;
};

const loadGraphRecords = async (storyId) => {
  const [
    story,
    characters,
    locations,
    worldRules,
    relationships,
    researchEntries,
    contextualNodes,
    sources,
    assets,
    scenePaths,
    continuityChecks,
  ] = await Promise.all([
    query('SELECT id, title, content, created_at, updated_at FROM stories WHERE id = $1', [storyId]),
    query('SELECT id, story_id, name, description, created_at, updated_at FROM characters WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, story_id, name, description, created_at, updated_at FROM locations WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, story_id, rule, category, created_at, updated_at FROM world_rules WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, story_id, source, target, relation, created_at FROM relationships WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, story_id, query, executive_summary, summary, technologies, historical_evolution, story_opportunities, created_at FROM research_entries WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, research_entry_id, story_id, label, type, description, parent_label, created_at FROM contextual_nodes WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, research_entry_id, story_id, title, category, trust_score, url, created_at FROM research_sources WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query('SELECT id, research_entry_id, story_id, asset_type, name, description, payload, created_at FROM story_assets WHERE story_id = $1 ORDER BY id ASC', [storyId]),
    query(
      `
        SELECT id, story_id, path_title, path_summary, impact, risk_level,
          narrative_score, selected_path, generated_scene, confidence,
          validation_status, created_at
        FROM generated_scenes
        WHERE story_id = $1
        ORDER BY id ASC
      `,
      [storyId]
    ),
    query('SELECT id, story_id, scene, contradiction, conflict_type, reason, confidence, retrieved_facts, created_at FROM continuity_checks WHERE story_id = $1 ORDER BY id ASC', [storyId]),
  ]);

  if (!story.rows[0]) {
    const error = new Error('Story not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    story: story.rows[0],
    characters: characters.rows,
    locations: locations.rows,
    worldRules: worldRules.rows,
    relationships: relationships.rows,
    researchEntries: researchEntries.rows,
    contextualNodes: contextualNodes.rows,
    sources: sources.rows,
    assets: assets.rows,
    scenePaths: scenePaths.rows,
    continuityChecks: continuityChecks.rows,
  };
};

const assetNodeType = (assetType) => {
  const normalized = String(assetType || '').toLowerCase();
  if (normalized.includes('faction')) return 'Faction';
  if (normalized.includes('conflict')) return 'Conflict';
  if (normalized.includes('plot') || normalized.includes('event')) return 'Event';
  if (normalized.includes('location')) return 'Location';
  if (normalized.includes('character')) return 'Character';
  if (normalized.includes('world')) return 'World Rule';
  return 'Object';
};

const buildGraph = (records) => {
  const nodeMap = new Map();
  const edges = [];
  const storyNodeId = `story-${records.story.id}`;

  addNode(nodeMap, makeNode({
    id: storyNodeId,
    label: records.story.title,
    nodeType: 'Story',
    description: records.story.content,
    source: 'Story Bible',
    createdAt: records.story.created_at,
    metadata: { lastUpdated: records.story.updated_at },
  }));

  for (const character of records.characters) {
    const id = `character-${character.id}`;
    addNode(nodeMap, makeNode({
      id,
      label: character.name,
      nodeType: 'Character',
      description: character.description,
      source: character.story_id ? 'Story Bible' : 'User Created',
      createdAt: character.created_at,
      metadata: { dbId: character.id, lastUpdated: character.updated_at },
    }));
    edges.push(makeEdge({ id: `story-character-${id}`, source: storyNodeId, target: id, relation: 'Part Of' }));
  }

  for (const location of records.locations) {
    const id = `location-${location.id}`;
    addNode(nodeMap, makeNode({
      id,
      label: location.name,
      nodeType: 'Location',
      description: location.description,
      source: location.story_id ? 'Story Bible' : 'User Created',
      createdAt: location.created_at,
      metadata: { dbId: location.id, lastUpdated: location.updated_at },
    }));
    edges.push(makeEdge({ id: `story-location-${id}`, source: storyNodeId, target: id, relation: 'Located In' }));
  }

  for (const rule of records.worldRules) {
    const id = `world-rule-${rule.id}`;
    addNode(nodeMap, makeNode({
      id,
      label: rule.category || 'World Rule',
      nodeType: 'World Rule',
      description: rule.rule,
      source: rule.category === 'Research' ? 'Research Agent' : 'Story Bible',
      createdAt: rule.created_at,
      metadata: { dbId: rule.id, category: rule.category, lastUpdated: rule.updated_at },
    }));
    edges.push(makeEdge({ id: `story-rule-${id}`, source: storyNodeId, target: id, relation: 'Depends On' }));
  }

  for (const research of records.researchEntries) {
    const id = `research-${research.id}`;
    addNode(nodeMap, makeNode({
      id,
      label: research.query,
      nodeType: 'Research Topic',
      description: research.executive_summary || research.summary,
      source: 'Research Agent',
      createdAt: research.created_at,
      metadata: {
        dbId: research.id,
        technologies: research.technologies || [],
        historicalEvolution: research.historical_evolution || [],
        storyOpportunities: research.story_opportunities || [],
        generatedBy: 'Groq Research Nexus',
      },
    }));
    edges.push(makeEdge({ id: `story-research-${id}`, source: storyNodeId, target: id, relation: 'Research Inspired' }));
  }

  for (const node of records.contextualNodes) {
    const id = `contextual-${node.id}`;
    const parentResearch = node.research_entry_id ? `research-${node.research_entry_id}` : storyNodeId;
    addNode(nodeMap, makeNode({
      id,
      label: node.label,
      nodeType: 'Contextual Node',
      description: node.description,
      source: 'Research Agent',
      createdAt: node.created_at,
      metadata: { dbId: node.id, parentLabel: node.parent_label, contextType: node.type },
    }));
    edges.push(makeEdge({ id: `research-context-${id}`, source: parentResearch, target: id, relation: 'Connected To' }));
  }

  for (const asset of records.assets) {
    const nodeType = assetNodeType(asset.asset_type);
    const id = `asset-${asset.asset_type}-${asset.id}`;
    addNode(nodeMap, makeNode({
      id,
      label: asset.name,
      nodeType,
      description: asset.description,
      source: 'Generated Asset',
      createdAt: asset.created_at,
      metadata: { dbId: asset.id, payload: asset.payload, assetType: asset.asset_type },
    }));
    const parent = asset.research_entry_id ? `research-${asset.research_entry_id}` : storyNodeId;
    edges.push(makeEdge({ id: `asset-parent-${id}`, source: parent, target: id, relation: 'Research Inspired' }));
  }

  for (const scene of records.scenePaths) {
    const id = `scene-${scene.id}`;
    addNode(nodeMap, makeNode({
      id,
      label: scene.path_title || scene.selected_path || 'Generated Scene',
      nodeType: 'Scene',
      description: scene.generated_scene || scene.path_summary || scene.impact || '',
      source: 'Scene Generation Agent',
      createdAt: scene.created_at,
      metadata: {
        dbId: scene.id,
        impact: scene.impact,
        riskLevel: scene.risk_level,
        narrativeScore: scene.narrative_score,
        confidence: scene.confidence,
        validationStatus: scene.validation_status,
        generatedBy: 'OpenAI Scene Generator',
      },
    }));
    edges.push(makeEdge({ id: `story-scene-${id}`, source: storyNodeId, target: id, relation: 'Appears In' }));
  }

  for (const check of records.continuityChecks) {
    const sceneId = `continuity-scene-${check.id}`;
    addNode(nodeMap, makeNode({
      id: sceneId,
      label: truncate(check.scene, 56),
      nodeType: check.contradiction ? 'Conflict' : 'Scene',
      description: check.reason || check.scene,
      source: 'Continuity Agent',
      createdAt: check.created_at,
      metadata: { dbId: check.id, confidence: check.confidence, conflictType: check.conflict_type, generatedBy: 'Groq Continuity Agent' },
    }));
    edges.push(makeEdge({
      id: `story-continuity-${sceneId}`,
      source: storyNodeId,
      target: sceneId,
      relation: check.contradiction ? 'Violates' : 'Connected To',
      sourceType: 'Continuity Agent',
    }));

    for (const fact of check.retrieved_facts || []) {
      const target = findNodeByLabel([...nodeMap.values()], fact) || [...nodeMap.values()].find((node) =>
        String(fact).toLowerCase().includes(String(node.data.fullLabel || node.data.label).toLowerCase())
      );
      if (target && target.id !== sceneId) {
        edges.push(makeEdge({
          id: `continuity-fact-${check.id}-${target.id}`,
          source: target.id,
          target: sceneId,
          relation: check.contradiction ? 'Violates' : 'Connected To',
          sourceType: 'Continuity Agent',
        }));
      }
    }
  }

  const nodes = [...nodeMap.values()];

  for (const research of records.researchEntries) {
    const researchNode = nodeMap.get(`research-${research.id}`);
    if (!researchNode) continue;

    researchNode.data.metadata.sources = records.sources
      .filter((source) => source.research_entry_id === research.id)
      .map((source) => ({
        title: source.title,
        category: source.category,
        trustScore: source.trust_score,
        url: source.url,
        createdAt: source.created_at,
      }));
  }

  for (const relationship of records.relationships) {
    const source = findNodeByLabel(nodes, relationship.source);
    const target = findNodeByLabel(nodes, relationship.target);
    if (!source || !target) continue;
    edges.push(makeEdge({
      id: `relationship-${relationship.id}`,
      source: source.id,
      target: target.id,
      relation: relationship.relation,
      sourceType: 'AI Relationship Discovery',
    }));
  }

  for (const research of records.researchEntries) {
    const researchNode = nodeMap.get(`research-${research.id}`);
    if (!researchNode) continue;
    for (const node of nodes) {
      if (node.id === researchNode.id || !['Character', 'Location', 'Faction', 'Object', 'World Rule'].includes(node.data.type)) continue;
      const text = `${research.executive_summary || ''} ${research.summary || ''} ${(research.story_opportunities || []).join(' ')}`.toLowerCase();
      const label = String(node.data.fullLabel || node.data.label).toLowerCase();
      if (label.length > 2 && text.includes(label)) {
        edges.push(makeEdge({
          id: `research-inspired-${research.id}-${node.id}`,
          source: researchNode.id,
          target: node.id,
          relation: 'Research Inspired',
          sourceType: 'Research Agent',
        }));
      }
    }
  }

  const uniqueEdges = [...new Map(edges.map((edge) => [edge.id, edge])).values()]
    .filter((edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target));
  const hydratedNodes = hydrateRelationships(applyLayout(nodes), uniqueEdges);

  return {
    story: { id: records.story.id, title: records.story.title },
    updatedAt: new Date().toISOString(),
    nodes: hydratedNodes,
    edges: uniqueEdges,
    counts: hydratedNodes.reduce((acc, node) => {
      acc[node.data.type] = (acc[node.data.type] || 0) + 1;
      return acc;
    }, {}),
  };
};

export const getStoryGraph = async (storyId) => {
  const parsedStoryId = Number.parseInt(storyId, 10);

  if (!Number.isInteger(parsedStoryId) || parsedStoryId <= 0) {
    const error = new Error('A valid story ID is required.');
    error.statusCode = 400;
    throw error;
  }

  return buildGraph(await loadGraphRecords(parsedStoryId));
};
