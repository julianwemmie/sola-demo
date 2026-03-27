import { useVersion } from '@/hooks/VersionContext';
import { History, GitCommitHorizontal, RotateCcw, ArrowLeftRight, Eye, ChevronLeft } from 'lucide-react';
import type { WorkflowVersion } from '@/data/versions';

export function HistoryTimeline() {
  const { state, actions } = useVersion();

  if (!state.historyOpen) return null;

  const isPreviewingOrComparing = state.mode.type !== 'editing';
  const activeVersionId =
    state.mode.type === 'previewing' || state.mode.type === 'comparing'
      ? state.mode.versionId
      : null;

  return (
    <div className="flex w-64 shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <History size={14} className="text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Version History
          </h3>
        </div>
      </div>

      {/* Back button when previewing/comparing */}
      {isPreviewingOrComparing && (
        <button
          onClick={() => {
            if (state.mode.type === 'previewing') actions.stopPreview();
            else actions.stopCompare();
          }}
          className="flex items-center gap-1.5 border-b border-border px-4 py-2 text-xs font-medium text-sola-blue hover:bg-accent transition-colors"
        >
          <ChevronLeft size={14} />
          Back to current
        </button>
      )}

      {/* Version list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {[...state.versions].reverse().map((version, idx) => (
            <VersionCard
              key={version.id}
              version={version}
              isCurrent={version.id === state.currentVersionId}
              isActive={version.id === activeVersionId}
              isLatest={idx === 0}
              onSelect={() => {
                if (version.id === activeVersionId) {
                  // Deselect
                  if (state.mode.type === 'previewing') actions.stopPreview();
                  else if (state.mode.type === 'comparing') actions.stopCompare();
                } else if (version.id === state.currentVersionId) {
                  // Clicking current version goes back to editing
                  if (state.mode.type !== 'editing') {
                    if (state.mode.type === 'previewing') actions.stopPreview();
                    else actions.stopCompare();
                  }
                } else {
                  actions.previewVersion(version.id);
                }
              }}
              onCompare={() => actions.compareVersion(version.id)}
              onRestore={() => actions.restoreVersion(version.id)}
              mode={state.mode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VersionCard({
  version,
  isCurrent,
  isActive,
  isLatest: _isLatest,
  onSelect,
  onCompare,
  onRestore,
  mode,
}: {
  version: WorkflowVersion;
  isCurrent: boolean;
  isActive: boolean;
  isLatest: boolean;
  onSelect: () => void;
  onCompare: () => void;
  onRestore: () => void;
  mode: { type: string };
}) {
  const formattedDate = formatDate(version.date);
  const isComparing = isActive && mode.type === 'comparing';
  const isPreviewing = isActive && mode.type === 'previewing';

  return (
    <div
      className={`
        group rounded-lg border transition-all duration-200 cursor-pointer
        ${isActive
          ? 'border-sola-blue bg-sola-blue/5 ring-1 ring-sola-blue/20'
          : 'border-transparent hover:border-border hover:bg-accent/50'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 px-3 py-2.5">
        {/* Timeline dot */}
        <div className="mt-0.5 flex flex-col items-center">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
            isCurrent
              ? 'bg-sola-blue text-white'
              : isActive
                ? 'bg-sola-blue/20 text-sola-blue'
                : 'bg-muted text-muted-foreground'
          }`}>
            <GitCommitHorizontal size={12} />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{version.label}</span>
            {isCurrent && (
              <span className="rounded-full bg-sola-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-sola-blue">
                Current
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{version.summary}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">{formattedDate}</p>
        </div>
      </div>

      {/* Expanded actions (when active and not the current version) */}
      {isActive && !isCurrent && (
        <div className="flex border-t border-border/50 px-1 py-1">
          {isPreviewing && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onCompare(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-sola-blue hover:bg-sola-blue/10 transition-colors"
              >
                <ArrowLeftRight size={12} />
                Compare
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRestore(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <RotateCcw size={12} />
                Restore
              </button>
            </>
          )}
          {isComparing && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                <Eye size={12} />
                Preview
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRestore(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <RotateCcw size={12} />
                Restore
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
