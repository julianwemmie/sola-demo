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
import { baseNodes, baseEdges } from '@/data/workflow';
import { useDiff } from '@/hooks/DiffContext';
import type { ChangeStatus } from '@/data/diff';

export function SideBySideView() {
  const nodeTypes: NodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ workflow: WorkflowEdge }), []);
  const { state } = useDiff();

  const afterEdges = useMemo(() => {
    const edgeChangeMap = new Map(
      state.diff.edgeChanges.map((c) => [c.edgeId, c.status]),
    );
    return state.proposedEdges.map((edge) => ({
      ...edge,
      data: {
        changeStatus: (edgeChangeMap.get(edge.id) ?? 'unchanged') as ChangeStatus,
      },
    }));
  }, [state.proposedEdges, state.diff.edgeChanges]);

  // Track which pane is driving the viewport to avoid feedback loops
  const sourceRef = useRef<'before' | 'after' | null>(null);

  return (
    <div className="flex h-full w-full">
      {/* Before */}
      <div className="flex flex-1 flex-col border-r border-border">
        <div className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
          Before
        </div>
        <div className="flex-1">
          <ReactFlowProvider>
            <SyncedPane
              id="before"
              nodes={baseNodes}
              edges={baseEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              sourceRef={sourceRef}
              readonly
            />
          </ReactFlowProvider>
        </div>
      </div>

      {/* After */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-amber-50 text-xs font-semibold text-amber-700">
          After (Proposed)
        </div>
        <div className="flex-1">
          <ReactFlowProvider>
            <SyncedPane
              id="after"
              nodes={state.proposedNodes}
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

// We use a custom event bus to sync viewports since the two ReactFlow
// instances live in separate providers and can't share refs directly.
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
  readonly,
}: {
  id: string;
  nodes: Parameters<typeof ReactFlow>[0]['nodes'];
  edges: Parameters<typeof ReactFlow>[0]['edges'];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  sourceRef: React.MutableRefObject<string | null>;
  readonly?: boolean;
}) {
  const { setViewport } = useReactFlow();
  const suppressRef = useRef(false);

  // Listen for viewport changes from the other pane
  useMemo(() => {
    return viewportBus.subscribe(id, (vp) => {
      suppressRef.current = true;
      setViewport(vp, { duration: 0 });
      // Allow a frame for the setViewport to settle before re-enabling emit
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
      nodesDraggable={!readonly}
      nodesConnectable={false}
      elementsSelectable={!readonly}
      panOnScroll
      zoomOnScroll={false}
      onViewportChange={onViewportChange}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d0d5dd" />
    </ReactFlow>
  );
}
