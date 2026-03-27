import { Clock, Settings, ChevronLeft, Video, Circle } from 'lucide-react';
import { useVersion } from '@/hooks/VersionContext';

export function TopBar() {
  const { state, actions } = useVersion();
  const nodeCount = state.workingNodes.length;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2">
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Workflow details</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold text-foreground">Contract Parsing Pipeline</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <StatusBadge nodeCount={nodeCount} />

        {/* Recording button (no-op for now) */}
        <div className="flex h-8 items-center rounded-md border border-border overflow-hidden">
          <button className="flex h-full items-center gap-1.5 border-r border-border px-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors">
            <Video size={14} className="text-muted-foreground" />
            Manage Recordings
          </button>
          <button
            className="flex h-full items-center gap-1.5 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            title="Start recording"
          >
            <Circle size={12} fill="currentColor" />
          </button>
        </div>

        <button
          data-history-toggle
          onClick={actions.toggleHistory}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            state.historyOpen
              ? 'bg-accent text-sola-blue'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
          title="Toggle version history"
        >
          <Clock size={16} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Settings size={16} />
        </button>
        <button className="ml-1 flex h-8 items-center rounded-md bg-sola-blue px-4 text-xs font-semibold text-white hover:bg-sola-blue/90 transition-colors">
          RUN WORKFLOW
        </button>
      </div>
    </header>
  );
}

function StatusBadge({ nodeCount }: { nodeCount: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-sola-green/30 bg-sola-green/10 px-3 py-1 text-xs font-medium text-sola-green">
      <div className="h-1.5 w-1.5 rounded-full bg-sola-green" />
      {nodeCount} of {nodeCount} Steps
    </div>
  );
}
