import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from 'reactflow';

export default function NarrativeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : style.strokeWidth || 1.8,
          filter: selected ? 'drop-shadow(0 0 8px rgba(34,211,238,0.65))' : undefined,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan rounded border border-white/10 bg-zinc-950/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-200 shadow-lg backdrop-blur"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
