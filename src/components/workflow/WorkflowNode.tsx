import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import { CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import type { WorkflowNodeData } from '@/data/workflow';
import type { ChangeStatus, ApprovalState } from '@/data/diff';
import { useDiff } from '@/hooks/DiffContext';

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

function getIcon(name: string): LucideIcon {
  const icon = (Icons as Record<string, unknown>)[name];
  if (icon) return icon as LucideIcon;
  return Icons.CircleDot as LucideIcon;
}

// Extended data with optional diff fields
interface DiffNodeData extends WorkflowNodeData {
  changeStatus?: ChangeStatus;
  approvalState?: ApprovalState;
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
  const approvalState = data.approvalState;
  const isDiff = changeStatus !== 'unchanged';
  const isRemoved = changeStatus === 'removed';

  const { state, actions } = useDiff();

  const handleClick = useCallback(() => {
    if (changeStatus === 'modified') {
      actions.setSelectedNodeId(state.selectedNodeId === id ? null : id);
    }
  }, [changeStatus, actions, state.selectedNodeId, id]);

  const borderClass = isDiff
    ? diffBorderStyles[changeStatus]
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
        ${changeStatus === 'modified' ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
    >
      {/* Diff badge */}
      {badge && badge.label && (
        <div className={`absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
          {badge.label}
        </div>
      )}

      {/* Approval indicator */}
      {isDiff && approvalState && approvalState !== 'pending' && (
        <div className={`absolute -top-2.5 right-3 flex h-5 w-5 items-center justify-center rounded-full ${
          approvalState === 'accepted' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {approvalState === 'accepted' ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
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

      {/* Per-change approval buttons */}
      {isDiff && state.enabled && approvalState === 'pending' && (
        <div className="flex border-t border-border">
          <button
            onClick={(e) => { e.stopPropagation(); actions.setApproval(id, 'accepted'); }}
            className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors rounded-bl-xl"
          >
            <Check size={14} />
            Accept
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={(e) => { e.stopPropagation(); actions.setApproval(id, 'rejected'); }}
            className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors rounded-br-xl"
          >
            <X size={14} />
            Reject
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
