import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { Plus } from 'lucide-react';
import type { ChangeStatus } from '@/data/diff';

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
  const changeStatus: ChangeStatus = data?.changeStatus ?? 'unchanged';
  const isRemoved = changeStatus === 'removed';
  const isAdded = changeStatus === 'added';

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
      {/* "Add step" button — only for unchanged edges */}
      {changeStatus === 'unchanged' && !isAdded && (
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
      )}
    </>
  );
}
