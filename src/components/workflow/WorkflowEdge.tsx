import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { Plus } from 'lucide-react';
import type { ChangeStatus } from '@/data/versions';
import { useVersion } from '@/hooks/VersionContext';

interface WorkflowEdgeData {
  changeStatus?: ChangeStatus;
  [key: string]: unknown;
}

const edgeColors: Record<ChangeStatus, string> = {
  added: '#22c55e',
  removed: '#ef4444',
  modified: '#f59e0b',
  unchanged: '#3b5bdb',
};

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
  data,
}: EdgeProps & { data?: WorkflowEdgeData }) {
  const { state, actions } = useVersion();
  const changeStatus: ChangeStatus = data?.changeStatus ?? 'unchanged';
  const isRemoved = changeStatus === 'removed';
  const isAdded = changeStatus === 'added';
  const isEditing = state.mode.type === 'editing';

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
          stroke: edgeColors[changeStatus],
          strokeWidth: 2,
          strokeDasharray: isRemoved || isAdded ? '6 4' : undefined,
          opacity: isRemoved ? 0.5 : 1,
        }}
        markerEnd={markerEnd}
      />
      {/* "Add step" button — only in editing mode for unchanged edges */}
      {isEditing && changeStatus === 'unchanged' && (
        <foreignObject
          x={labelX - 12}
          y={labelY - 12}
          width={24}
          height={24}
          className="pointer-events-auto"
        >
          <div
            onClick={() => {
              // Find the source node of this edge to pass to addNode
              const edge = state.workingEdges.find((e) => e.id === id);
              if (edge) actions.addNode(edge.source, id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 transition-opacity cursor-pointer hover:border-sola-blue hover:text-sola-blue [.react-flow:hover_&]:opacity-100"
          >
            <Plus size={12} />
          </div>
        </foreignObject>
      )}
    </>
  );
}
