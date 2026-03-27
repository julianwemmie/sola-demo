import { useVersion } from '@/hooks/VersionContext';
import { Minus, Plus, Pencil, GitCommitHorizontal, Undo2, ArrowRight } from 'lucide-react';
import type { ChangeStatus } from '@/data/versions';
import type { ConfigField } from '@/data/workflow';

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

export function StagingChangesList() {
  const { state, actions } = useVersion();

  if (state.mode.type !== 'editing' || !state.hasUncommittedChanges || !state.stagingDiff || !state.changesListOpen) return null;

  const nodeChanges = state.stagingDiff.nodeChanges.filter((c) => c.status !== 'unchanged');
  const currentVersion = state.versions.find((v) => v.id === state.currentVersionId);

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Changes
        </h3>
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto">
        {nodeChanges.length > 0 && (
          <div className="px-2 pt-2 pb-1">
            <div className="space-y-1">
              {nodeChanges.map((change) => {
                const workingNode = state.workingNodes.find((n) => n.id === change.nodeId);
                const committedNode = currentVersion?.nodes.find((n) => n.id === change.nodeId);
                const label = workingNode?.data.label ?? committedNode?.data.label ?? change.nodeId;
                return (
                  <ChangeItem
                    key={change.nodeId}
                    label={label}
                    status={change.status}
                    originalConfig={change.originalConfig}
                    currentConfig={workingNode?.data.config}
                    committedConfig={committedNode?.data.config}
                    originalLabel={change.originalLabel}
                    originalDescription={change.originalDescription}
                    currentLabel={workingNode?.data.label}
                    currentDescription={workingNode?.data.description}
                    onRevert={() => actions.revertNodeChange(change.nodeId)}
                    onClick={() => actions.focusNode(change.nodeId)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {nodeChanges.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            No changes
          </div>
        )}
      </div>
    </div>
  );
}

function ChangeItem({
  label,
  status,
  originalConfig,
  currentConfig,
  committedConfig,
  originalLabel,
  originalDescription,
  currentLabel,
  currentDescription,
  onRevert,
  onClick,
}: {
  label: string;
  status: ChangeStatus;
  originalConfig?: ConfigField[];
  currentConfig?: ConfigField[];
  committedConfig?: ConfigField[];
  originalLabel?: string;
  originalDescription?: string;
  currentLabel?: string;
  currentDescription?: string;
  onRevert: () => void;
  onClick: () => void;
}) {
  const StatusIcon = statusIcon[status];
  const oldConfig = originalConfig ?? committedConfig;
  const nameRenamed = originalLabel && currentLabel && originalLabel !== currentLabel;
  const descRenamed = originalDescription && currentDescription && originalDescription !== currentDescription;

  return (
    <div className="rounded-lg border border-transparent hover:border-border transition-colors cursor-pointer" onClick={onClick}>
      {/* Header row */}
      <div className="group flex items-center gap-2 px-2.5 py-2 text-xs">
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${statusColors[status]}`}>
          <StatusIcon size={12} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground">{statusLabel[status]}</div>
        </div>
        <button
          onClick={onRevert}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-600 hover:bg-amber-50 transition-all"
          title="Revert this change"
        >
          <Undo2 size={12} />
        </button>
      </div>

      {/* Name/description rename */}
      {status === 'modified' && (nameRenamed || descRenamed) && (
        <div className="mx-2.5 mb-1.5 rounded border border-border overflow-hidden text-[10px]">
          {nameRenamed && (
            <div className="px-2 py-1.5 border-b border-border last:border-b-0">
              <div className="font-medium text-muted-foreground mb-0.5">Name</div>
              <div className="flex items-center gap-1">
                <span className="text-red-500 line-through">{originalLabel}</span>
                <ArrowRight size={8} className="text-muted-foreground shrink-0" />
                <span className="text-emerald-600">{currentLabel}</span>
              </div>
            </div>
          )}
          {descRenamed && (
            <div className="px-2 py-1.5">
              <div className="font-medium text-muted-foreground mb-0.5">Description</div>
              <div className="flex items-center gap-1">
                <span className="text-red-500 line-through">{originalDescription}</span>
                <ArrowRight size={8} className="text-muted-foreground shrink-0" />
                <span className="text-emerald-600">{currentDescription}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field-level details */}
      {status === 'modified' && oldConfig && currentConfig && (
        <FieldDiff oldConfig={oldConfig} newConfig={currentConfig} />
      )}
      {status === 'added' && currentConfig && (
        <div className="mx-2.5 mb-2 rounded border border-emerald-200 bg-emerald-50/50 overflow-hidden">
          {currentConfig.map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 px-2 py-1 text-[10px] border-b border-emerald-100 last:border-b-0">
              <span className="text-emerald-700 font-medium">{f.label}</span>
              <span className="text-emerald-600 truncate">{f.value}</span>
            </div>
          ))}
        </div>
      )}
      {status === 'removed' && oldConfig && (
        <div className="mx-2.5 mb-2 rounded border border-red-200 bg-red-50/50 overflow-hidden">
          {oldConfig.map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 px-2 py-1 text-[10px] border-b border-red-100 last:border-b-0 line-through opacity-60">
              <span className="text-red-700 font-medium">{f.label}</span>
              <span className="text-red-600 truncate">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldDiff({ oldConfig, newConfig }: { oldConfig: ConfigField[]; newConfig: ConfigField[] }) {
  const allLabels = new Set([
    ...oldConfig.map((f) => f.label),
    ...newConfig.map((f) => f.label),
  ]);

  const diffs: { label: string; type: 'added' | 'removed' | 'changed' | 'unchanged'; oldValue?: string; newValue?: string }[] = [];

  for (const label of allLabels) {
    const oldField = oldConfig.find((f) => f.label === label);
    const newField = newConfig.find((f) => f.label === label);

    if (oldField && !newField) {
      diffs.push({ label, type: 'removed', oldValue: oldField.value });
    } else if (!oldField && newField) {
      diffs.push({ label, type: 'added', newValue: newField.value });
    } else if (oldField && newField && oldField.value !== newField.value) {
      diffs.push({ label, type: 'changed', oldValue: oldField.value, newValue: newField.value });
    }
  }

  if (diffs.length === 0) return null;

  return (
    <div className="mx-2.5 mb-2 rounded border border-border overflow-hidden text-[10px]">
      {diffs.map((d) => (
        <div key={d.label} className="border-b border-border last:border-b-0">
          {d.type === 'changed' && (
            <div className="px-2 py-1.5">
              <div className="font-medium text-muted-foreground mb-0.5">{d.label}</div>
              <div className="flex items-center gap-1">
                <span className="text-red-500 line-through">{d.oldValue}</span>
                <ArrowRight size={8} className="text-muted-foreground shrink-0" />
                <span className="text-emerald-600">{d.newValue}</span>
              </div>
            </div>
          )}
          {d.type === 'added' && (
            <div className="px-2 py-1.5 bg-emerald-50/50">
              <span className="font-medium text-emerald-700">{d.label}:</span>{' '}
              <span className="text-emerald-600">{d.newValue}</span>
            </div>
          )}
          {d.type === 'removed' && (
            <div className="px-2 py-1.5 bg-red-50/50 line-through opacity-60">
              <span className="font-medium text-red-700">{d.label}:</span>{' '}
              <span className="text-red-600">{d.oldValue}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
