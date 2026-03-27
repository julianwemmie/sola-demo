import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  applyNodeChanges,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  type Edge,
  type Node,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { useVersion } from '@/hooks/VersionContext';
import type { WorkflowNodeData } from '@/data/workflow';

/** Strip diff metadata before syncing back to version state */
function stripDiffMeta(nodes: Node<WorkflowNodeData>[]): Node<WorkflowNodeData>[] {
  return nodes
    .filter((n) => (n.data as Record<string, unknown>).changeStatus !== 'removed')
    .map((n) => {
      const { changeStatus, originalConfig, approvalState, ...cleanData } = n.data as Record<string, unknown>;
      return { ...n, data: cleanData as WorkflowNodeData };
    });
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}

function WorkflowCanvasInner() {
  const nodeTypes: NodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ workflow: WorkflowEdge }), []);
  const { state, actions } = useVersion();
  const { fitView } = useReactFlow();

  const isEditing = state.mode.type === 'editing';

  // Track local node positions for dragging
  const [localNodes, setLocalNodes] = useState<Node<WorkflowNodeData>[]>(state.displayNodes);

  // Focus/zoom to a specific node when requested
  useEffect(() => {
    if (state.focusedNodeId) {
      const nodeId = state.focusedNodeId;
      actions.clearFocusedNode();
      // Small delay to ensure the node is rendered
      requestAnimationFrame(() => {
        fitView({ nodes: [{ id: nodeId }], duration: 300, padding: 0.5 });
      });
    }
  }, [state.focusedNodeId, actions, fitView]);

  // Sync when display nodes change (mode switch, version change, etc.)
  useEffect(() => {
    setLocalNodes(state.displayNodes);
  }, [state.displayNodes]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    // Always allow React Flow internal changes (dimensions, selection reset)
    // but block user-driven edits (position, remove) in non-editing modes
    if (!isEditing) {
      const internalChanges = changes.filter((c) => c.type === 'dimensions');
      if (internalChanges.length > 0) {
        setLocalNodes((nds) => applyNodeChanges(internalChanges, nds) as Node<WorkflowNodeData>[]);
      }
      return;
    }

    // Intercept remove changes — route through our deleteNode action
    const removeChanges = changes.filter((c) => c.type === 'remove');
    if (removeChanges.length > 0) {
      for (const change of removeChanges) {
        if (change.type === 'remove') {
          actions.deleteNode(change.id);
        }
      }
      // Don't apply remove changes to local state — deleteNode will update
      // workingNodes which triggers displayNodes → localNodes sync
      const nonRemoveChanges = changes.filter((c) => c.type !== 'remove');
      if (nonRemoveChanges.length > 0) {
        setLocalNodes((nds) => applyNodeChanges(nonRemoveChanges, nds) as Node<WorkflowNodeData>[]);
      }
      return;
    }

    setLocalNodes((nds) => {
      const updated = applyNodeChanges(changes, nds) as Node<WorkflowNodeData>[];
      // Sync position changes back to version state (strip diff metadata)
      const positionChanges = changes.filter((c) => c.type === 'position' && 'position' in c && c.position);
      if (positionChanges.length > 0) {
        actions.setWorkingNodes(stripDiffMeta(updated));
      }
      return updated;
    });
  }, [isEditing, actions]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!isEditing) return;
    actions.setEditingNodeId(state.editingNodeId === node.id ? null : node.id);
  }, [isEditing, actions, state.editingNodeId]);

  // Close edit panel when clicking canvas background
  const onPaneClick = useCallback(() => {
    if (state.editingNodeId) {
      actions.setEditingNodeId(null);
    }
  }, [actions, state.editingNodeId]);

  const edges: Edge[] = useMemo(() => {
    return state.displayEdges;
  }, [state.displayEdges]);

  const onInit = useCallback((instance: { fitView: (opts?: Record<string, unknown>) => void }) => {
    setTimeout(() => instance.fitView({ padding: 0.15 }), 50);
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={localNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
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
        nodesDraggable={isEditing}
        nodesConnectable={false}
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
