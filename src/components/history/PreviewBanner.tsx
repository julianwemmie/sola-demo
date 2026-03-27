import { useVersion } from '@/hooks/VersionContext';
import { Eye, X } from 'lucide-react';

export function PreviewBanner() {
  const { state, actions } = useVersion();

  const { mode } = state;
  if (mode.type !== 'previewing') return null;

  const version = state.versions.find((v) => v.id === mode.versionId);
  if (!version) return null;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-amber-50/50 px-4">
      <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
        <Eye size={14} />
        Viewing {version.label} — {version.summary}
      </div>
      <button
        onClick={actions.stopPreview}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
