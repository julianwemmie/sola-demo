import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { WorkflowNodeData } from '@/data/workflow';

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

function getIcon(name: string): LucideIcon {
  const icon = (Icons as Record<string, unknown>)[name];
  if (icon) return icon as LucideIcon;
  return Icons.CircleDot as LucideIcon;
}

function WorkflowNodeComponent({ data, selected }: NodeProps & { data: WorkflowNodeData }) {
  const Icon = getIcon(data.icon);

  return (
    <div
      className={`
        group relative w-[260px] rounded-xl border bg-card text-card-foreground
        shadow-sm shadow-black/5 transition-all duration-200
        ${selected
          ? 'border-sola-blue ring-2 ring-sola-blue/30'
          : 'border-border hover:border-sola-blue/50'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sola-blue-muted text-sola-blue">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {data.label}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {data.description}
          </p>
        </div>
        {data.status === 'success' && (
          <CheckCircle2 size={16} className="shrink-0 text-sola-green" />
        )}
        {data.status === 'error' && (
          <AlertCircle size={16} className="shrink-0 text-destructive" />
        )}
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-border" />

      {/* Config fields */}
      <div className="px-4 py-3 space-y-1.5">
        {data.config.map((field) => (
          <div key={field.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{field.label}</span>
            <span className="truncate text-right font-medium text-foreground/80">
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-[5px] !h-2.5 !w-2.5 !rounded-full !border-2 !border-card !bg-sola-edge"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!-right-[5px] !h-2.5 !w-2.5 !rounded-full !border-2 !border-card !bg-sola-edge"
      />
    </div>
  );
}

export const WorkflowNode = memo(WorkflowNodeComponent);
