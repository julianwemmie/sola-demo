import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  applyNodeChanges,
  type NodeTypes,
  type EdgeTypes,
  type Edge,
  type Node,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { useDiff } from '@/hooks/DiffContext';
import type { WorkflowNodeData } from '@/data/workflow';
import type { ChangeStatus } from '@/data/diff';

export function WorkflowCanvas() {
  const nodeTypes: NodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ workflow: WorkflowEdge }), []);
  const { state } = useDiff();

  // Track user-driven node changes (dragging, selection) on top of state-driven nodes
  const [localNodes, setLocalNodes] = useState<Node<WorkflowNodeData>[]>([]);
  const [initialized, setInitialized] = useState(false);

  // When diff state nodes change, reset local state
  const displayNodes = useMemo(() => {
    // Reset when source data changes
    setLocalNodes(state.proposedNodes);
    setInitialized(false);
    return state.proposedNodes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.proposedNodes]);

  const nodes = initialized ? localNodes : displayNodes;

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setLocalNodes((nds) => applyNodeChanges(changes, nds) as Node<WorkflowNodeData>[]);
    setInitialized(true);
  }, []);

  // Build edges with diff metadata
  const edges: Edge[] = useMemo(() => {
    if (!state.enabled) return state.proposedEdges;

    const edgeChangeMap = new Map(
      state.diff.edgeChanges.map((c) => [c.edgeId, c.status]),
    );

    const proposedWithStatus = state.proposedEdges.map((edge) => ({
      ...edge,
      data: {
        changeStatus: (edgeChangeMap.get(edge.id) ?? 'unchanged') as ChangeStatus,
      },
    }));

    const ghostWithStatus = state.ghostEdges.map((edge) => ({
      ...edge,
      data: { changeStatus: 'removed' as ChangeStatus },
    }));

    return [...proposedWithStatus, ...ghostWithStatus];
  }, [state.enabled, state.proposedEdges, state.ghostEdges, state.diff.edgeChanges]);

  const onInit = useCallback((instance: { fitView: (opts?: Record<string, unknown>) => void }) => {
    setTimeout(() => instance.fitView({ padding: 0.15 }), 50);
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{
          type: 'workflow',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
        panOnScroll
        zoomOnScroll={false}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d0d5dd"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
        />
        <MiniMap
          nodeColor="#1a2332"
          maskColor="rgba(240, 242, 245, 0.7)"
          position="bottom-right"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
