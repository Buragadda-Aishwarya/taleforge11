import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls as FlowControls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CharacterNode from './nodes/CharacterNode';
import LocationNode from './nodes/LocationNode';
import ArtifactNode from './nodes/ArtifactNode';
import LoreNode from './nodes/LoreNode';
import NarrativeEdge from './edges/NarrativeEdge';
import {
  getStoryGraph,
  loadLatestStoryUpload,
} from '@/services/storyApi';
import { initialEdges, initialNodes } from '@/data/graphData';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Filter,
  Maximize,
  Minus,
  Search,
  Trash2,
} from 'lucide-react';

const MAX_INITIAL_NODES = 30;

const nodeTypes = {
  character: CharacterNode,
  location: LocationNode,
  artifact: ArtifactNode,
  lore: LoreNode,
  scene: ArtifactNode,
};

const edgeTypes = {
  narrative: NarrativeEdge,
};

const modeConfig = {
  story: {
    label: 'Story Graph',
    types: ['Story', 'Character', 'Location', 'World Rule', 'Faction', 'Object'],
  },
  research: {
    label: 'Research Graph',
    types: ['Story', 'Research Topic', 'Contextual Node', 'Faction', 'Object', 'World Rule'],
  },
  continuity: {
    label: 'Continuity Graph',
    types: ['Story', 'Conflict', 'World Rule', 'Character', 'Scene'],
  },
  scene: {
    label: 'Scene Graph',
    types: ['Story', 'Scene', 'Event', 'Conflict', 'Character', 'Location', 'Faction'],
  },
};

const filterOptions = [
  ['Character', 'Characters'],
  ['Location', 'Locations'],
  ['World Rule', 'World Rules'],
  ['Research Topic', 'Research Nodes'],
  ['Contextual Node', 'Context Nodes'],
  ['Scene', 'Scene Nodes'],
  ['Conflict', 'Continuity Violations'],
  ['Event', 'Events'],
  ['Faction', 'Factions'],
  ['Object', 'Objects'],
];

const flowTypeToGraphType = {
  character: 'Character',
  location: 'Location',
  artifact: 'Object',
  lore: 'World Rule',
  scene: 'Scene',
};

const normalizeGraphNode = (node) => ({
  ...node,
  data: {
    ...node.data,
    id: node.data?.id || node.id,
    type: node.data?.type || flowTypeToGraphType[node.type] || 'Object',
    fullLabel: node.data?.fullLabel || node.data?.label,
    source: node.data?.source || 'Sample Graph',
    createdAt: node.data?.createdAt || null,
    lastUpdated: node.data?.lastUpdated || node.data?.createdAt || null,
    generatedBy: node.data?.generatedBy || node.data?.source || 'Sample Graph',
    relationships: node.data?.relationships || [],
    connectedNodes: node.data?.connectedNodes || [],
  },
});

const normalizedInitialNodes = initialNodes.map(normalizeGraphNode);
const normalizedInitialEdges = initialEdges.map((edge) => ({
  ...edge,
  type: 'narrative',
  data: {
    relation: edge.label,
    source: 'Sample Graph',
  },
}));

const formatDate = (value) => {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
};

const relationshipKey = (edge) => `${edge.source}:${edge.target}:${edge.label}`;

const radialLayout = (nodes, edges, selectedId) => {
  if (!nodes.length) return nodes;
  const centerId = selectedId && nodes.some((node) => node.id === selectedId)
    ? selectedId
    : nodes.find((node) => node.data.type === 'Story')?.id || nodes[0].id;
  const center = { x: 620, y: 380 };
  const connected = new Set(
    edges
      .filter((edge) => edge.source === centerId || edge.target === centerId)
      .flatMap((edge) => [edge.source, edge.target])
  );
  connected.delete(centerId);
  const firstRing = nodes.filter((node) => connected.has(node.id));
  const secondRing = nodes.filter((node) => node.id !== centerId && !connected.has(node.id));

  const placeRing = (items, radius, startAngle = -Math.PI / 2) =>
    items.map((node, index) => {
      const angle = startAngle + (index / Math.max(items.length, 1)) * Math.PI * 2;
      return {
        ...node,
        position: {
          x: Math.round(center.x + Math.cos(angle) * radius),
          y: Math.round(center.y + Math.sin(angle) * radius),
        },
      };
    });

  return [
    ...nodes.filter((node) => node.id === centerId).map((node) => ({ ...node, position: center })),
    ...placeRing(firstRing, 260),
    ...placeRing(secondRing, 430, Math.PI / 8),
  ];
};

function GraphHeader({
  graphStatus,
  mode,
  setMode,
  searchQuery,
  setSearchQuery,
  visibleCount,
  totalCount,
}) {
  return (
    <div className="absolute left-5 right-5 top-5 z-30 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between pointer-events-none">
      <div className="rounded-xl border border-white/10 bg-black/75 px-4 py-3 backdrop-blur-xl pointer-events-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
          {graphStatus.loading ? 'Loading Graph' : 'Narrative Intelligence Graph'}
        </div>
        <div className="mt-1 font-display text-lg text-white">{graphStatus.title}</div>
        <div className="mt-1 font-mono text-[10px] text-zinc-500">
          Showing {visibleCount} of {totalCount} nodes
        </div>
        {graphStatus.error && <div className="mt-2 text-xs text-red-300">{graphStatus.error}</div>}
      </div>

      <div className="flex flex-col gap-3 pointer-events-auto">
        <div className="flex flex-wrap justify-end gap-2">
          {Object.entries(modeConfig).map(([id, config]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                mode === id
                  ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                  : 'border-white/10 bg-black/55 text-zinc-400 hover:border-purple-400/40 hover:text-purple-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex w-full max-w-md items-center gap-2 rounded-xl border border-purple-500/20 bg-zinc-950/70 px-3 py-2 backdrop-blur-xl">
          <Search className="h-4 w-4 text-purple-300/70" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search node..."
            className="w-full bg-transparent text-sm text-purple-100 outline-none placeholder:text-purple-300/40"
          />
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ filters, toggleFilter }) {
  return (
    <div className="absolute bottom-6 left-5 z-30 w-[280px] rounded-xl border border-white/10 bg-black/75 p-4 backdrop-blur-xl">
      <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
        <Filter className="h-4 w-4 text-cyan-300" />
        Filters
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {filterOptions.map(([type, label]) => (
          <label key={type} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={Boolean(filters[type])}
              onChange={() => toggleFilter(type)}
              className="h-4 w-4 accent-cyan-400"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function DetailsPanel({ node, onExpand, onCollapse, isExpanded }) {
  if (!node) {
    return (
      <div className="absolute right-5 top-40 z-30 hidden w-[340px] rounded-xl border border-white/10 bg-black/75 p-5 text-sm text-zinc-400 backdrop-blur-xl xl:block">
        Select a node to inspect relationships, sources, and actions.
      </div>
    );
  }

  const sources = node.data.metadata?.sources || [];

  return (
    <aside className="absolute right-5 top-40 z-30 max-h-[calc(100vh-11rem)] w-[360px] overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">{node.data.type}</div>
          <h2 className="mt-1 font-display text-xl text-white">{node.data.fullLabel || node.data.label}</h2>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[9px] uppercase text-zinc-400">
          {node.data.source}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-300">{node.data.description || 'No description available.'}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <div className="font-mono text-[9px] uppercase text-zinc-500">Generated By</div>
          <div className="mt-1 text-zinc-200">{node.data.generatedBy || node.data.source}</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <div className="font-mono text-[9px] uppercase text-zinc-500">Last Updated</div>
          <div className="mt-1 text-zinc-200">{formatDate(node.data.lastUpdated || node.data.createdAt)}</div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Relationships</h3>
        <div className="space-y-2">
          {(node.data.relationships || []).slice(0, 8).map((relationship, index) => (
            <div key={`${relationship.nodeId}-${index}`} className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
              <span className="text-cyan-300">{relationship.relation}</span> {relationship.label}
            </div>
          ))}
          {!node.data.relationships?.length && <p className="text-xs text-zinc-500">No visible relationships in this mode.</p>}
        </div>
      </div>

      {sources.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">References</h3>
          <div className="space-y-2">
            {sources.slice(0, 6).map((source, index) => (
              <a
                key={`${source.title}-${index}`}
                href={source.url || undefined}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 hover:border-cyan-400/30"
              >
                <div className="text-zinc-100">{source.title}</div>
                <div className="mt-1 text-zinc-500">{source.category} · Trust {source.trustScore || 70}%</div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={() => (isExpanded ? onCollapse(node.id) : onExpand(node.id))} className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200">
          {isExpanded ? <Minus className="mr-1 inline h-3 w-3" /> : <ChevronRight className="mr-1 inline h-3 w-3" />}
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300">
          <Eye className="mr-1 inline h-3 w-3" />
          View Details
        </button>
        <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300">Open Bible</button>
        <button className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300">
          <Trash2 className="mr-1 inline h-3 w-3" />
          Delete
        </button>
      </div>
    </aside>
  );
}

function GraphControls({ onFit }) {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute right-5 bottom-6 z-30 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/75 p-2 backdrop-blur-xl">
      <button onClick={() => zoomIn({ duration: 200 })} className="rounded-lg p-3 text-cyan-300 hover:bg-cyan-400/10" title="Zoom In">
        <ChevronDown className="h-5 w-5 rotate-180" />
      </button>
      <button onClick={() => zoomOut({ duration: 200 })} className="rounded-lg p-3 text-cyan-300 hover:bg-cyan-400/10" title="Zoom Out">
        <ChevronDown className="h-5 w-5" />
      </button>
      <button onClick={onFit} className="rounded-lg p-3 text-purple-300 hover:bg-purple-400/10" title="Fit View">
        <Maximize className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function KnowledgeGraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(normalizedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(normalizedInitialEdges);
  const [fullGraph, setFullGraph] = useState({ nodes: normalizedInitialNodes, edges: normalizedInitialEdges });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [mode, setMode] = useState('story');
  const [searchQuery, setSearchQuery] = useState('');
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [filters, setFilters] = useState(() =>
    Object.fromEntries(filterOptions.map(([type]) => [type, modeConfig.story.types.includes(type)]))
  );
  const [graphStatus, setGraphStatus] = useState({ loading: false, error: '', title: 'Sample Knowledge Graph' });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...Object.fromEntries(filterOptions.map(([type]) => [type, modeConfig[mode].types.includes(type)])),
    }));
    setExpandedNodes(new Set());
  }, [mode]);

  useEffect(() => {
    let mounted = true;
    const latestUpload = loadLatestStoryUpload();
    const storyId = latestUpload?.uploadResult?.story?.id;

    if (!storyId || String(storyId).startsWith('local-')) return undefined;

    const loadGraph = async () => {
      setGraphStatus((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const graph = await getStoryGraph(storyId);
        if (!mounted) return;
        setFullGraph({ nodes: (graph.nodes || []).map(normalizeGraphNode), edges: graph.edges || [] });
        setGraphStatus({
          loading: false,
          error: '',
          title: graph.story?.title || 'Story Knowledge Graph',
        });
      } catch (error) {
        if (!mounted) return;
        setGraphStatus({
          loading: false,
          error: error.message || 'Unable to load story graph.',
          title: 'Sample Knowledge Graph',
        });
      }
    };

    loadGraph();
    const intervalId = window.setInterval(loadGraph, 10000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const visibleGraph = useMemo(() => {
    const enabledTypes = new Set(Object.entries(filters).filter(([, enabled]) => enabled).map(([type]) => type));
    enabledTypes.add('Story');
    const search = searchQuery.trim().toLowerCase();
    const graphEdges = fullGraph.edges || [];
    const baseNodes = (fullGraph.nodes || []).filter((node) => enabledTypes.has(node.data.type));
    const selectedIds = new Set();

    if (search) {
      for (const node of fullGraph.nodes || []) {
        const haystack = `${node.data.fullLabel || node.data.label} ${node.data.description || ''}`.toLowerCase();
        if (haystack.includes(search)) {
          selectedIds.add(node.id);
          graphEdges
            .filter((edge) => edge.source === node.id || edge.target === node.id)
            .forEach((edge) => {
              selectedIds.add(edge.source);
              selectedIds.add(edge.target);
            });
        }
      }
    }

    for (const nodeId of expandedNodes) {
      selectedIds.add(nodeId);
      graphEdges
        .filter((edge) => edge.source === nodeId || edge.target === nodeId)
        .forEach((edge) => {
          selectedIds.add(edge.source);
          selectedIds.add(edge.target);
        });
    }

    let visibleNodes = baseNodes.filter((node) => !search || selectedIds.has(node.id));

    if (!search && expandedNodes.size === 0) {
      const priority = { Story: 0, Character: 1, Location: 2, 'World Rule': 3, Faction: 4, Object: 5, 'Research Topic': 6, Scene: 7, Conflict: 8, Event: 9, 'Contextual Node': 10 };
      visibleNodes = [...visibleNodes]
        .sort((a, b) => (priority[a.data.type] ?? 20) - (priority[b.data.type] ?? 20))
        .slice(0, MAX_INITIAL_NODES);
    }

    if (selectedIds.size > 0) {
      const extraNodes = (fullGraph.nodes || []).filter((node) => selectedIds.has(node.id));
      visibleNodes = [...new Map([...visibleNodes, ...extraNodes].map((node) => [node.id, node])).values()].slice(0, 60);
    }

    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    const visibleEdges = graphEdges
      .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
      .filter((edge, index, arr) => arr.findIndex((item) => relationshipKey(item) === relationshipKey(edge)) === index);

    return {
      nodes: radialLayout(visibleNodes, visibleEdges, selectedNodeId),
      edges: visibleEdges.map((edge) => {
        const connected = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
        return {
          ...edge,
          selected: Boolean(connected),
          style: {
            ...(edge.style || {}),
            opacity: selectedNodeId ? (connected ? 1 : 0.18) : 0.82,
          },
        };
      }),
    };
  }, [expandedNodes, filters, fullGraph, searchQuery, selectedNodeId]);

  useEffect(() => {
    setNodes(visibleGraph.nodes);
    setEdges(visibleGraph.edges);
    if (reactFlowInstance) {
      window.setTimeout(() => reactFlowInstance.fitView({ duration: 500, padding: 0.2 }), 50);
    }
  }, [reactFlowInstance, setEdges, setNodes, visibleGraph]);

  const selectedNode = useMemo(
    () => (fullGraph.nodes || []).find((node) => node.id === selectedNodeId),
    [fullGraph.nodes, selectedNodeId]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'narrative', animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const toggleFilter = (type) => setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  const expandNode = (id) => setExpandedNodes((prev) => new Set([...prev, id]));
  const collapseNode = (id) => setExpandedNodes((prev) => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });

  return (
    <div className="absolute inset-0 bg-zinc-950">
      <GraphHeader
        graphStatus={graphStatus}
        mode={mode}
        setMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        visibleCount={nodes.length}
        totalCount={fullGraph.nodes?.length || 0}
      />
      <FilterPanel filters={filters} toggleFilter={toggleFilter} />
      <DetailsPanel
        node={selectedNode}
        onExpand={expandNode}
        onCollapse={collapseNode}
        isExpanded={selectedNodeId ? expandedNodes.has(selectedNodeId) : false}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        className="touch-none"
      >
        <Background color="rgba(168, 85, 247, 0.16)" gap={50} size={1} />
        <MiniMap
          pannable
          zoomable
          className="!bottom-6 !left-[320px] !right-auto !h-32 !w-48 !rounded-xl !border !border-white/10 !bg-black/70"
          nodeColor={(node) => node.data?.color || '#64748b'}
        />
        <FlowControls showInteractive={false} className="!hidden" />
        <GraphControls onFit={() => reactFlowInstance?.fitView({ duration: 500, padding: 0.2 })} />
      </ReactFlow>
    </div>
  );
}
