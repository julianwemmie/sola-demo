import { useMemo, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
  type Viewport,
} from '@xyflow/react';

import { WorkflowNode } from '@/components/workflow/WorkflowNode';
import { WorkflowEdge } from '@/components/workflow/WorkflowEdge';
import { useVersion } from '@/hooks/VersionContext';


export function CompareSideBySide() {
  const nodeTypes: NodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ workflow: WorkflowEdge }), []);
  const { state } = useVersion();

  if (state.mode.type !== 'comparing') return null;
  const isComparingCurrent = state.mode.compareTarget === 'current';

  const selectedVersion = state.compareVersion;
  if (!selectedVersion) return null;

  // Resolve before/after based on compare target
  const beforeVersion = isComparingCurrent
    ? selectedVersion
    : state.previewPreviousVersion;
  const afterLabel = isComparingCurrent
    ? state.versions.find((v) => v.id === state.currentVersionId)
    : selectedVersion;
  const afterNodes = isComparingCurrent
    ? state.compareNodes
    : state.displayNodes;
  const afterEdges = isComparingCurrent
    ? [...state.compareEdges, ...state.compareGhostEdges]
    : state.displayEdges;

  if (!beforeVersion || !afterLabel) return null;

  const sourceRef = useRef<'before' | 'after' | null>(null);

  return (
    <div className="flex h-full w-full">
      {/* Before */}
      <div className="flex flex-1 flex-col border-r border-border">
        <div className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
          {beforeVersion.label} — {beforeVersion.summary}
        </div>
        <div className="flex-1">
          <ReactFlowProvider>
            <SyncedPane
              id="before"
              nodes={beforeVersion.nodes}
              edges={beforeVersion.edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              sourceRef={sourceRef}
            />
          </ReactFlowProvider>
        </div>
      </div>

      {/* After */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-sola-blue/5 text-xs font-semibold text-sola-blue">
          {afterLabel.label} — {afterLabel.summary}
        </div>
        <div className="flex-1">
          <ReactFlowProvider>
            <SyncedPane
              id="after"
              nodes={afterNodes}
              edges={afterEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              sourceRef={sourceRef}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}

const viewportBus = {
  listeners: new Map<string, (vp: Viewport) => void>(),
  emit(source: string, vp: Viewport) {
    for (const [id, fn] of this.listeners) {
      if (id !== source) fn(vp);
    }
  },
  subscribe(id: string, fn: (vp: Viewport) => void) {
    this.listeners.set(id, fn);
    return () => { this.listeners.delete(id); };
  },
};

function SyncedPane({
  id,
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  sourceRef,
}: {
  id: string;
  nodes: Parameters<typeof ReactFlow>[0]['nodes'];
  edges: Parameters<typeof ReactFlow>[0]['edges'];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  sourceRef: React.MutableRefObject<string | null>;
}) {
  const { setViewport } = useReactFlow();
  const suppressRef = useRef(false);

  useMemo(() => {
    return viewportBus.subscribe(id, (vp) => {
      suppressRef.current = true;
      setViewport(vp, { duration: 0 });
      requestAnimationFrame(() => { suppressRef.current = false; });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setViewport]);

  const onViewportChange = useCallback(
    (vp: Viewport) => {
      if (suppressRef.current) return;
      sourceRef.current = id;
      viewportBus.emit(id, vp);
    },
    [id, sourceRef],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      defaultEdgeOptions={{ type: 'workflow' }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll={false}
      onViewportChange={onViewportChange}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d0d5dd" />
    </ReactFlow>
  );
}
