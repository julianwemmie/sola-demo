import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { Plus } from 'lucide-react';

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: '#3b5bdb',
          strokeWidth: 2,
        }}
        markerEnd={markerEnd}
      />
      {/* "Add step" button on edge midpoint */}
      <foreignObject
        x={labelX - 12}
        y={labelY - 12}
        width={24}
        height={24}
        className="pointer-events-auto"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 transition-opacity hover:border-sola-blue hover:text-sola-blue group-hover:opacity-100 [.react-flow:hover_&]:opacity-100">
          <Plus size={12} />
        </div>
      </foreignObject>
    </>
  );
}
