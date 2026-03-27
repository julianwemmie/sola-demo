import { useState, useEffect } from 'react';
import { useVersion } from '@/hooks/VersionContext';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { ConfigField } from '@/data/workflow';

export function EditPanel() {
  const { state, actions } = useVersion();

  if (!state.editingNodeId) return null;

  const node = state.workingNodes.find((n) => n.id === state.editingNodeId);
  if (!node) return null;

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-border bg-card animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Edit Node</h3>
          <p className="text-xs text-muted-foreground">{node.data.label}</p>
        </div>
        <button
          onClick={() => actions.setEditingNodeId(null)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Edit form */}
      <div className="flex-1 overflow-y-auto">
        <NodeEditForm
          key={state.editingNodeId}
          nodeId={state.editingNodeId}
          label={node.data.label}
          description={node.data.description}
          config={node.data.config}
          onUpdateLabel={(label, description) => actions.updateNodeLabel(state.editingNodeId!, label, description)}
          onUpdateConfig={(config) => actions.updateNodeConfig(state.editingNodeId!, config)}
        />
      </div>

      {/* Delete button */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => actions.deleteNode(state.editingNodeId!)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Delete Node
        </button>
      </div>
    </div>
  );
}

function NodeEditForm({
  nodeId,
  label: initialLabel,
  description: initialDescription,
  config: initialConfig,
  onUpdateLabel,
  onUpdateConfig,
}: {
  nodeId: string;
  label: string;
  description: string;
  config: ConfigField[];
  onUpdateLabel: (label: string, description: string) => void;
  onUpdateConfig: (config: ConfigField[]) => void;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [description, setDescription] = useState(initialDescription);
  const [config, setConfig] = useState<ConfigField[]>(initialConfig);

  // Sync label/description changes immediately
  useEffect(() => {
    if (label !== initialLabel || description !== initialDescription) {
      onUpdateLabel(label, description);
    }
  }, [label, description]);

  // Sync config changes immediately
  useEffect(() => {
    if (JSON.stringify(config) !== JSON.stringify(initialConfig)) {
      onUpdateConfig(config);
    }
  }, [config]);

  const updateField = (index: number, key: 'label' | 'value', val: string) => {
    setConfig((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: val } : f)));
  };

  const removeField = (index: number) => {
    setConfig((prev) => prev.filter((_, i) => i !== index));
  };

  const addField = () => {
    setConfig((prev) => [...prev, { label: '', value: '' }]);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Name
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-sola-blue focus:outline-none focus:ring-1 focus:ring-sola-blue/30"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-sola-blue focus:outline-none focus:ring-1 focus:ring-sola-blue/30"
        />
      </div>

      {/* Config fields */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Configuration
        </label>
        <div className="space-y-2">
          {config.map((field, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(i, 'label', e.target.value)}
                placeholder="Key"
                className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-sola-blue focus:outline-none focus:ring-1 focus:ring-sola-blue/30"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateField(i, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-sola-blue focus:outline-none focus:ring-1 focus:ring-sola-blue/30"
              />
              <button
                onClick={() => removeField(i)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addField}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-sola-blue hover:bg-sola-blue/10 transition-colors"
        >
          <Plus size={12} />
          Add field
        </button>
      </div>
    </div>
  );
}
