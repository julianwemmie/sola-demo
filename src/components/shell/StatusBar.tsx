import { CheckCircle2, GitCommitHorizontal } from 'lucide-react';
import { useVersion } from '@/hooks/VersionContext';

export function StatusBar() {
  const { state } = useVersion();
  const currentVersion = state.versions.find((v) => v.id === state.currentVersionId);
  const nodeCount = state.workingNodes.length;

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={11} className="text-sola-green" />
          All steps passing
        </span>
        <span className="text-border">|</span>
        <span>Last run: 2 min ago</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <GitCommitHorizontal size={11} />
          {currentVersion?.label ?? 'v1'}
        </span>
        <span className="text-border">|</span>
        <span>{nodeCount} nodes</span>
        {state.hasUncommittedChanges && (
          <>
            <span className="text-border">|</span>
            <span className="text-amber-600 font-medium">Uncommitted changes</span>
          </>
        )}
      </div>
    </footer>
  );
}
