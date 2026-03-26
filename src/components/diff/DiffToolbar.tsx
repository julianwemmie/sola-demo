import { useDiff } from '@/hooks/DiffContext';
import {
  CheckCheck,
  XCircle,
  Columns2,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function DiffToolbar() {
  const { state, actions } = useDiff();

  if (!state.enabled) return null;

  const pendingCount = state.approvals.filter((a) => a.approval === 'pending').length;
  const acceptedCount = state.approvals.filter((a) => a.approval === 'accepted').length;
  const rejectedCount = state.approvals.filter((a) => a.approval === 'rejected').length;
  const totalChanges = state.approvals.length;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-amber-50/50 px-4">
      {/* Left: status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
          <Sparkles size={14} />
          AI Proposed Changes
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
            {totalChanges} changes
          </span>
          {acceptedCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
              {acceptedCount} accepted
            </span>
          )}
          {rejectedCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
              {rejectedCount} rejected
            </span>
          )}
          {pendingCount > 0 && (
            <span className="text-muted-foreground">
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* View toggle */}
        <button
          onClick={actions.toggleViewMode}
          className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {state.viewMode === 'inline' ? <Columns2 size={13} /> : <Layers size={13} />}
          {state.viewMode === 'inline' ? 'Side-by-Side' : 'Inline'}
        </button>

        <div className="h-5 w-px bg-border" />

        {/* Bulk actions */}
        <button
          onClick={actions.acceptAll}
          className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <CheckCheck size={13} />
          Accept All
        </button>
        <button
          onClick={actions.rejectAll}
          className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <XCircle size={13} />
          Reject All
        </button>

        <div className="h-5 w-px bg-border" />

        {/* Apply */}
        <button
          onClick={actions.applyApproved}
          className="flex h-7 items-center gap-1.5 rounded-md bg-sola-blue px-3 text-xs font-semibold text-white hover:bg-sola-blue/90 transition-colors"
        >
          Apply
          <ArrowRight size={12} />
        </button>

        {/* Close */}
        <button
          onClick={actions.disableDiff}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <XCircle size={14} />
        </button>
      </div>
    </div>
  );
}
