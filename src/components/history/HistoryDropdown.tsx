import { useRef, useEffect } from 'react';
import { useVersion } from '@/hooks/VersionContext';
import { History, GitCommitHorizontal, RotateCcw, ArrowLeftRight, Eye, ChevronLeft } from 'lucide-react';
import type { WorkflowVersion } from '@/data/versions';

export function HistoryDropdown() {
  const { state, actions } = useVersion();
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Ignore clicks on the toggle button (it handles its own toggle)
      if (target.closest('[data-history-toggle]')) return;
      if (ref.current && !ref.current.contains(target)) {
        actions.toggleHistory();
      }
    }
    if (state.historyOpen) {
      document.addEventListener('mousedown', handleClick, true);
      return () => document.removeEventListener('mousedown', handleClick, true);
    }
  }, [state.historyOpen, actions]);

  if (!state.historyOpen) return null;

  const isPreviewingOrComparing = state.mode.type !== 'editing';
  const activeVersionId =
    state.mode.type === 'previewing' || state.mode.type === 'comparing'
      ? state.mode.versionId
      : null;

  return (
    <div
      ref={ref}
      className="absolute right-16 top-12 z-50 w-72 rounded-lg border border-border bg-card shadow-lg shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-150"
    >
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
          className="flex w-full items-center gap-1.5 border-b border-border px-4 py-2 text-xs font-medium text-sola-blue hover:bg-accent transition-colors"
        >
          <ChevronLeft size={14} />
          Back to current
        </button>
      )}

      {/* Version list */}
      <div className="max-h-80 overflow-y-auto px-2 py-2">
        <div className="space-y-0.5">
          {[...state.versions].reverse().map((version, idx) => (
            <VersionCard
              key={version.id}
              version={version}
              isCurrent={version.id === state.currentVersionId}
              isActive={version.id === activeVersionId}
              isLatest={idx === 0}
              onSelect={() => {
                if (version.id === activeVersionId) {
                  if (state.mode.type === 'previewing') actions.stopPreview();
                  else if (state.mode.type === 'comparing') actions.stopCompare();
                } else if (version.id === state.currentVersionId) {
                  if (state.mode.type !== 'editing') {
                    if (state.mode.type === 'previewing') actions.stopPreview();
                    else actions.stopCompare();
                  }
                } else {
                  actions.previewVersion(version.id);
                }
              }}
              onCompareCurrent={() => actions.compareVersion(version.id, 'current')}
              onComparePrevious={() => actions.compareVersion(version.id, 'previous')}
              onPreview={() => actions.previewVersion(version.id)}
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
  onSelect,
  onCompareCurrent,
  onComparePrevious,
  onPreview,
  onRestore,
  mode,
}: {
  version: WorkflowVersion;
  isCurrent: boolean;
  isActive: boolean;
  isLatest: boolean;
  onSelect: () => void;
  onCompareCurrent: () => void;
  onComparePrevious: () => void;
  onPreview: () => void;
  onRestore: () => void;
  mode: { type: string; compareTarget?: string };
}) {
  const formattedDate = formatDate(version.date);
  const isComparingCurrent = isActive && mode.type === 'comparing' && mode.compareTarget === 'current';
  const isComparingPrevious = isActive && mode.type === 'comparing' && mode.compareTarget === 'previous';
  const isPreviewing = isActive && mode.type === 'previewing';

  return (
    <div
      className={`
        group rounded-lg border transition-all duration-150 cursor-pointer
        ${isActive
          ? 'border-sola-blue bg-sola-blue/5 ring-1 ring-sola-blue/20'
          : 'border-transparent hover:border-border hover:bg-accent/50'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2.5 px-2.5 py-2">
        {/* Timeline dot */}
        <div className="mt-0.5">
          <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
            isCurrent
              ? 'bg-sola-blue text-white'
              : isActive
                ? 'bg-sola-blue/20 text-sola-blue'
                : 'bg-muted text-muted-foreground'
          }`}>
            <GitCommitHorizontal size={10} />
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
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{version.summary}</p>
          <p className="text-[10px] text-muted-foreground/70">{formattedDate}</p>
        </div>
      </div>

      {/* Expanded actions */}
      {isActive && !isCurrent && (
        <div className="flex border-t border-border/50 px-1 py-1">
          {isPreviewing && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onCompareCurrent(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-sola-blue hover:bg-sola-blue/10 transition-colors"
              >
                <ArrowLeftRight size={12} />
                Compare Current
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
          {isComparingCurrent && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onComparePrevious(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-sola-blue hover:bg-sola-blue/10 transition-colors"
              >
                <ArrowLeftRight size={12} />
                Compare Previous
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
          {isComparingPrevious && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onCompareCurrent(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-sola-blue hover:bg-sola-blue/10 transition-colors"
              >
                <ArrowLeftRight size={12} />
                Compare Current
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
