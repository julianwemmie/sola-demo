import { useDiff } from '@/hooks/DiffContext';
import { X, Check, Minus, Plus } from 'lucide-react';
import type { ConfigField } from '@/data/workflow';

export function DetailPanel() {
  const { state, actions } = useDiff();

  if (!state.enabled || !state.selectedNodeId) return null;

  const node = state.proposedNodes.find((n) => n.id === state.selectedNodeId);
  if (!node) return null;

  const nodeChange = state.diff.nodeChanges.find(
    (c) => c.nodeId === state.selectedNodeId,
  );
  if (!nodeChange || nodeChange.status !== 'modified') return null;

  const originalConfig = nodeChange.originalConfig ?? [];
  const newConfig = node.data.config;

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-border bg-card animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{node.data.label}</h3>
          <p className="text-xs text-amber-600 font-medium">Modified</p>
        </div>
        <button
          onClick={() => actions.setSelectedNodeId(null)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Config diff */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Configuration Changes
        </h4>
        <div className="space-y-2">
          <ConfigDiff original={originalConfig} updated={newConfig} />
        </div>
      </div>

      {/* Approval actions */}
      <div className="flex border-t border-border">
        <button
          onClick={() => actions.setApproval(state.selectedNodeId!, 'accepted')}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <Check size={16} />
          Accept
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => actions.setApproval(state.selectedNodeId!, 'rejected')}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <X size={16} />
          Reject
        </button>
      </div>
    </div>
  );
}

function ConfigDiff({
  original,
  updated,
}: {
  original: ConfigField[];
  updated: ConfigField[];
}) {
  const allLabels = new Set([
    ...original.map((f) => f.label),
    ...updated.map((f) => f.label),
  ]);

  return (
    <div className="rounded-lg border border-border overflow-hidden text-xs font-mono">
      {[...allLabels].map((label) => {
        const oldField = original.find((f) => f.label === label);
        const newField = updated.find((f) => f.label === label);

        if (oldField && !newField) {
          // Removed field
          return (
            <div key={label} className="flex items-start gap-2 bg-red-50 px-3 py-2 border-b border-border last:border-b-0">
              <Minus size={12} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <span className="text-red-700 font-medium">{label}:</span>{' '}
                <span className="text-red-500 line-through">{oldField.value}</span>
              </div>
            </div>
          );
        }

        if (!oldField && newField) {
          // Added field
          return (
            <div key={label} className="flex items-start gap-2 bg-emerald-50 px-3 py-2 border-b border-border last:border-b-0">
              <Plus size={12} className="mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <span className="text-emerald-700 font-medium">{label}:</span>{' '}
                <span className="text-emerald-600">{newField.value}</span>
              </div>
            </div>
          );
        }

        if (oldField && newField && oldField.value !== newField.value) {
          // Changed field
          return (
            <div key={label} className="border-b border-border last:border-b-0">
              <div className="flex items-start gap-2 bg-red-50 px-3 py-1.5">
                <Minus size={12} className="mt-0.5 shrink-0 text-red-500" />
                <div>
                  <span className="text-red-700 font-medium">{label}:</span>{' '}
                  <span className="text-red-500 line-through">{oldField.value}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-emerald-50 px-3 py-1.5">
                <Plus size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <span className="text-emerald-700 font-medium">{label}:</span>{' '}
                  <span className="text-emerald-600">{newField.value}</span>
                </div>
              </div>
            </div>
          );
        }

        // Unchanged field
        return (
          <div key={label} className="flex items-start gap-2 px-3 py-2 border-b border-border last:border-b-0 text-muted-foreground">
            <span className="mt-0.5 w-3 shrink-0" />
            <div>
              <span className="font-medium">{label}:</span>{' '}
              <span>{newField?.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
