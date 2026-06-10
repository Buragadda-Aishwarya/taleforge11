import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import CharacterNode from './nodes/CharacterNode';
import LocationNode from './nodes/LocationNode';
import ArtifactNode from './nodes/ArtifactNode';
import LoreNode from './nodes/LoreNode';
import GraphToolbar from './GraphToolbar';

import { initialNodes, initialEdges } from '@/data/graphData';

// Register custom node types
const nodeTypes = {
  character: CharacterNode,
  location: LocationNode,
  artifact: ArtifactNode,
  lore: LoreNode,
};

// Controls wrapper to use ReactFlow hooks
function CustomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <GraphToolbar 
      onZoomIn={zoomIn} 
      onZoomOut={zoomOut} 
      onResetView={() => fitView({ duration: 800 })} 
    />
  );
}

export default function KnowledgeGraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(34, 211, 238, 0.4)', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    // Optionally handle node click here (e.g. open inspector)
    console.log('Node clicked:', node.id, node.data);
  }, []);

  return (
    <div className="absolute inset-0 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        className="touch-none"
      >
        <Background color="rgba(168, 85, 247, 0.15)" gap={50} size={1} />
        <CustomControls />
      </ReactFlow>
    </div>
  );
}
