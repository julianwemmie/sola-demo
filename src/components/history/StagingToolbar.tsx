import { useVersion } from '@/hooks/VersionContext';
import { GitCommitHorizontal, Columns2, Layers, List } from 'lucide-react';

export function StagingToolbar() {
  const { state, actions } = useVersion();

  if (state.mode.type !== 'editing' || !state.hasUncommittedChanges) return null;

  const diff = state.stagingDiff;
  const addedNodes = diff?.nodeChanges.filter((c) => c.status === 'added').length ?? 0;
  const removedNodes = diff?.nodeChanges.filter((c) => c.status === 'removed').length ?? 0;
  const modifiedNodes = diff?.nodeChanges.filter((c) => c.status === 'modified').length ?? 0;
  const totalChanges = addedNodes + removedNodes + modifiedNodes;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-amber-50/50 px-4">
      {/* Left: status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
          <GitCommitHorizontal size={14} />
          Uncommitted Changes
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
            {totalChanges} change{totalChanges !== 1 ? 's' : ''}
          </span>
          {addedNodes > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
              +{addedNodes} added
            </span>
          )}
          {removedNodes > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
              -{removedNodes} removed
            </span>
          )}
          {modifiedNodes > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
              ~{modifiedNodes} modified
            </span>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* View changes list */}
        <button
          onClick={actions.toggleChangesList}
          className={`flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors ${
            state.changesListOpen
              ? 'border-sola-blue bg-sola-blue/10 text-sola-blue'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <List size={13} />
          {state.changesListOpen ? 'Hide Changes' : 'View Changes'}
        </button>

        {/* View toggle */}
        <button
          onClick={actions.toggleCompareViewMode}
          className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {state.compareViewMode === 'inline' ? <Columns2 size={13} /> : <Layers size={13} />}
          {state.compareViewMode === 'inline' ? 'Side-by-Side' : 'Inline'}
        </button>

        <div className="h-5 w-px bg-border" />

        {/* Commit */}
        <button
          onClick={() => actions.confirmCommit()}
          className="flex h-7 items-center gap-1.5 rounded-md bg-sola-blue px-3 text-xs font-semibold text-white hover:bg-sola-blue/90 transition-colors"
        >
          <GitCommitHorizontal size={13} />
          Commit
        </button>
      </div>
    </div>
  );
}
