import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import { CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import type { WorkflowNodeData } from '@/data/workflow';
import type { ChangeStatus } from '@/data/versions';
import { useVersion } from '@/hooks/VersionContext';

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

function getIcon(name: string): LucideIcon {
  const icon = (Icons as Record<string, unknown>)[name];
  if (icon) return icon as LucideIcon;
  return Icons.CircleDot as LucideIcon;
}

interface DiffNodeData extends WorkflowNodeData {
  changeStatus?: ChangeStatus;
}

const diffBorderStyles: Record<ChangeStatus, string> = {
  added: 'border-emerald-500 ring-2 ring-emerald-500/20',
  removed: 'border-red-400 ring-2 ring-red-400/20 opacity-50',
  modified: 'border-amber-500 ring-2 ring-amber-500/20',
  unchanged: 'border-border',
};

const diffBadgeStyles: Record<ChangeStatus, { bg: string; text: string; label: string }> = {
  added: { bg: 'bg-emerald-500', text: 'text-white', label: 'Added' },
  removed: { bg: 'bg-red-500', text: 'text-white', label: 'Removed' },
  modified: { bg: 'bg-amber-500', text: 'text-white', label: 'Modified' },
  unchanged: { bg: '', text: '', label: '' },
};

function WorkflowNodeComponent({ id, data, selected }: NodeProps & { data: DiffNodeData }) {
  const Icon = getIcon(data.icon);
  const changeStatus = data.changeStatus ?? 'unchanged';
  const isDiff = changeStatus !== 'unchanged';
  const isRemoved = changeStatus === 'removed';

  const { state, actions } = useVersion();
  const isEditing = state.mode.type === 'editing';
  const isEditingThis = state.editingNodeId === id;

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actions.deleteNode(id);
  }, [actions, id]);

  const borderClass = isDiff
    ? diffBorderStyles[changeStatus]
    : isEditingThis
      ? 'border-sola-blue ring-2 ring-sola-blue/30'
      : selected
        ? 'border-sola-blue ring-2 ring-sola-blue/30'
        : 'border-border hover:border-sola-blue/50';

  const badge = isDiff ? diffBadgeStyles[changeStatus] : null;

  return (
    <div
      className={`
        group relative w-[260px] rounded-xl border bg-card text-card-foreground
        shadow-sm shadow-black/5 transition-all duration-200
        ${borderClass}
        ${isRemoved ? 'line-through decoration-red-400/50' : ''}
        ${isEditing ? 'cursor-pointer' : ''}
      `}
    >
      {/* Diff badge */}
      {badge && badge.label && (
        <div className={`absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
          {badge.label}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isDiff
            ? changeStatus === 'added'
              ? 'bg-emerald-500/10 text-emerald-600'
              : changeStatus === 'removed'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-amber-500/10 text-amber-600'
            : 'bg-sola-blue-muted text-sola-blue'
        }`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-sm font-semibold ${isRemoved ? 'text-muted-foreground' : 'text-foreground'}`}>
            {data.label}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {data.description}
          </p>
        </div>
        {!isDiff && data.status === 'success' && (
          <CheckCircle2 size={16} className="shrink-0 text-sola-green" />
        )}
        {!isDiff && data.status === 'error' && (
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
            <span className={`truncate text-right font-medium ${isRemoved ? 'text-muted-foreground/50' : 'text-foreground/80'}`}>
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Edit/delete hover actions in editing mode */}
      {isEditing && !isDiff && (
        <div className="absolute -top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); actions.setEditingNodeId(id); }}
            className="flex h-5 w-5 items-center justify-center rounded bg-card border border-border text-muted-foreground hover:text-sola-blue hover:border-sola-blue transition-colors"
            title="Edit"
          >
            <Pencil size={10} />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-5 w-5 items-center justify-center rounded bg-card border border-border text-muted-foreground hover:text-red-500 hover:border-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

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
