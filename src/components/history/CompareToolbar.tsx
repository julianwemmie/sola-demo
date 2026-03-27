import { useVersion } from '@/hooks/VersionContext';
import { ArrowLeftRight, Columns2, Layers, X } from 'lucide-react';

export function CompareToolbar() {
  const { state, actions } = useVersion();

  if (state.mode.type !== 'comparing') return null;

  const compareVersion = state.versions.find((v) => v.id === state.mode.versionId);
  const currentVersion = state.versions.find((v) => v.id === state.currentVersionId);
  if (!compareVersion || !currentVersion) return null;

  const diff = state.compareDiff;
  const addedNodes = diff?.nodeChanges.filter((c) => c.status === 'added').length ?? 0;
  const removedNodes = diff?.nodeChanges.filter((c) => c.status === 'removed').length ?? 0;
  const modifiedNodes = diff?.nodeChanges.filter((c) => c.status === 'modified').length ?? 0;
  const totalChanges = addedNodes + removedNodes + modifiedNodes;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-sola-blue/5 px-4">
      {/* Left: status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-sola-blue">
          <ArrowLeftRight size={14} />
          Comparing {compareVersion.label} vs {currentVersion.label}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-sola-blue/10 px-2 py-0.5 font-medium text-sola-blue">
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

      {/* Right: view toggle + close */}
      <div className="flex items-center gap-2">
        <button
          onClick={actions.toggleCompareViewMode}
          className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {state.compareViewMode === 'inline' ? <Columns2 size={13} /> : <Layers size={13} />}
          {state.compareViewMode === 'inline' ? 'Side-by-Side' : 'Inline'}
        </button>
        <button
          onClick={actions.stopCompare}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
