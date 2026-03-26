import { useDiff } from '@/hooks/DiffContext';
import { Check, X, Minus, Plus, Pencil, GitCommitHorizontal, Cable } from 'lucide-react';
import type { ChangeStatus, ApprovalState } from '@/data/diff';

const statusIcon: Record<ChangeStatus, React.ComponentType<{ size?: number; className?: string }>> = {
  added: Plus,
  removed: Minus,
  modified: Pencil,
  unchanged: GitCommitHorizontal,
};

const statusColors: Record<ChangeStatus, string> = {
  added: 'text-emerald-600 bg-emerald-50',
  removed: 'text-red-500 bg-red-50',
  modified: 'text-amber-600 bg-amber-50',
  unchanged: 'text-muted-foreground bg-muted',
};

const statusLabel: Record<ChangeStatus, string> = {
  added: 'Added',
  removed: 'Removed',
  modified: 'Modified',
  unchanged: 'Unchanged',
};

export function ChangesList() {
  const { state, actions } = useDiff();

  if (!state.enabled) return null;

  const nodeChanges = state.diff.nodeChanges.filter((c) => c.status !== 'unchanged');
  const edgeChanges = state.diff.edgeChanges.filter((c) => c.status !== 'unchanged');

  return (
    <div className="flex w-64 shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Changes
        </h3>
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto">
        {/* Node changes */}
        {nodeChanges.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nodes
            </div>
            <div className="space-y-1">
              {nodeChanges.map((change) => {
                const node = state.proposedNodes.find((n) => n.id === change.nodeId);
                const approval = state.approvals.find((a) => a.id === change.nodeId);
                if (!node) return null;
                return (
                  <ChangeItem
                    key={change.nodeId}
                    id={change.nodeId}
                    label={node.data.label}
                    status={change.status}
                    approval={approval?.approval ?? 'pending'}
                    selected={state.selectedNodeId === change.nodeId}
                    onClick={() => actions.setSelectedNodeId(
                      state.selectedNodeId === change.nodeId ? null : change.nodeId,
                    )}
                    onAccept={() => actions.setApproval(change.nodeId, 'accepted')}
                    onReject={() => actions.setApproval(change.nodeId, 'rejected')}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Edge changes */}
        {edgeChanges.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Connections
            </div>
            <div className="space-y-1">
              {edgeChanges.map((change) => {
                const approval = state.approvals.find((a) => a.id === change.edgeId);
                return (
                  <ChangeItem
                    key={change.edgeId}
                    id={change.edgeId}
                    label={formatEdgeLabel(change.edgeId)}
                    status={change.status}
                    approval={approval?.approval ?? 'pending'}
                    selected={false}
                    icon={<Cable size={12} />}
                    onAccept={() => actions.setApproval(change.edgeId, 'accepted')}
                    onReject={() => actions.setApproval(change.edgeId, 'rejected')}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChangeItem({
  label,
  status,
  approval,
  selected,
  icon,
  onClick,
  onAccept,
  onReject,
}: {
  id: string;
  label: string;
  status: ChangeStatus;
  approval: ApprovalState;
  selected: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const StatusIcon = statusIcon[status];

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors
        ${selected ? 'bg-accent ring-1 ring-sola-blue/30' : 'hover:bg-accent/50'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Status icon */}
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${statusColors[status]}`}>
        {icon ?? <StatusIcon size={12} />}
      </div>

      {/* Label + status */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{statusLabel[status]}</div>
      </div>

      {/* Approval state or actions */}
      {approval === 'pending' ? (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(); }}
            className="flex h-5 w-5 items-center justify-center rounded text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <Check size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            className="flex h-5 w-5 items-center justify-center rounded text-red-500 hover:bg-red-100 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          approval === 'accepted' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {approval === 'accepted' ? <Check size={10} className="text-white" /> : <X size={10} className="text-white" />}
        </div>
      )}
    </div>
  );
}

function formatEdgeLabel(edgeId: string): string {
  // e-validate-crosscheck → Validate → Cross-Check
  const parts = edgeId.replace('e-', '').split('-');
  // Group into source/target by finding common node name patterns
  const mapping: Record<string, string> = {
    'validate': 'Validate',
    'format': 'Format',
    'crosscheck': 'Cross-Check',
    'upload': 'Upload',
    'parse': 'Parse',
    'extract': 'Extract',
  };

  if (edgeId === 'e-validate-format') return 'Validate → Format';
  if (edgeId === 'e-validate-crosscheck') return 'Validate → Cross-Check';
  if (edgeId === 'e-crosscheck-format') return 'Cross-Check → Format';

  return parts.map((p) => mapping[p] ?? p).join(' → ');
}
