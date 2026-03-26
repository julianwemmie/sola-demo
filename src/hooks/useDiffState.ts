import { useState, useCallback, useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from '@/data/workflow';
import { baseNodes, baseEdges } from '@/data/workflow';
import {
  buildProposedWorkflow,
  removedEdge,
  type WorkflowDiff,
  type ChangeApproval,
  type ApprovalState,
  type ChangeStatus,
} from '@/data/diff';

export interface DiffState {
  enabled: boolean;
  viewMode: 'inline' | 'side-by-side';
  diff: WorkflowDiff;
  approvals: ChangeApproval[];
  selectedNodeId: string | null;
  /** The proposed (after) nodes with diff metadata baked into data */
  proposedNodes: Node<WorkflowNodeData>[];
  /** The proposed (after) edges */
  proposedEdges: Edge[];
  /** Ghost edges that were removed (rendered as dashed red) */
  ghostEdges: Edge[];
}

export interface DiffActions {
  enableDiff: () => void;
  disableDiff: () => void;
  toggleViewMode: () => void;
  setSelectedNodeId: (id: string | null) => void;
  setApproval: (id: string, approval: ApprovalState) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  applyApproved: () => void;
}

export function useDiffState() {
  const [enabled, setEnabled] = useState(false);
  const [applied, setApplied] = useState(false);
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side'>('inline');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ChangeApproval[]>([]);

  const { nodes: rawProposedNodes, edges: proposedEdges, diff } = useMemo(
    () => buildProposedWorkflow(),
    [],
  );

  // Initialize approvals from diff when enabling
  const enableDiff = useCallback(() => {
    const initial: ChangeApproval[] = [
      ...diff.nodeChanges
        .filter((c) => c.status !== 'unchanged')
        .map((c) => ({
          id: c.nodeId,
          type: 'node' as const,
          status: c.status,
          approval: 'pending' as ApprovalState,
        })),
      ...diff.edgeChanges
        .filter((c) => c.status !== 'unchanged')
        .map((c) => ({
          id: c.edgeId,
          type: 'edge' as const,
          status: c.status,
          approval: 'pending' as ApprovalState,
        })),
    ];
    setApprovals(initial);
    setEnabled(true);
    setSelectedNodeId(null);
  }, [diff]);

  const disableDiff = useCallback(() => {
    setEnabled(false);
    setSelectedNodeId(null);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((m) => (m === 'inline' ? 'side-by-side' : 'inline'));
  }, []);

  const setApproval = useCallback((id: string, approval: ApprovalState) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, approval } : a)),
    );
  }, []);

  const acceptAll = useCallback(() => {
    setApprovals((prev) => prev.map((a) => ({ ...a, approval: 'accepted' })));
  }, []);

  const rejectAll = useCallback(() => {
    setApprovals((prev) => prev.map((a) => ({ ...a, approval: 'rejected' })));
  }, []);

  const applyApproved = useCallback(() => {
    setApplied(true);
    setEnabled(false);
    setSelectedNodeId(null);
  }, []);

  // Helper to look up approval and change status for a given ID
  const getNodeChangeStatus = useCallback(
    (nodeId: string): ChangeStatus => {
      const change = diff.nodeChanges.find((c) => c.nodeId === nodeId);
      return change?.status ?? 'unchanged';
    },
    [diff],
  );

  const getApprovalForId = useCallback(
    (id: string): ApprovalState | undefined => {
      return approvals.find((a) => a.id === id)?.approval;
    },
    [approvals],
  );

  // Bake diff metadata into node data so the node component can render it
  const proposedNodes: Node<WorkflowNodeData>[] = useMemo(() => {
    if (!enabled && !applied) return baseNodes;
    if (!enabled && applied) return rawProposedNodes;
    return rawProposedNodes.map((node) => {
      const changeStatus = getNodeChangeStatus(node.id);
      const approval = getApprovalForId(node.id);
      const nodeChange = diff.nodeChanges.find((c) => c.nodeId === node.id);
      return {
        ...node,
        data: {
          ...node.data,
          changeStatus,
          approvalState: approval,
          originalConfig: nodeChange?.originalConfig,
        },
      };
    });
  }, [enabled, rawProposedNodes, getNodeChangeStatus, getApprovalForId, diff]);

  // Ghost edges (removed edges rendered with dashed red)
  const ghostEdges: Edge[] = useMemo(() => {
    if (!enabled) return [];
    return [removedEdge];
  }, [enabled]);

  const activeEdges = useMemo(() => {
    if (!enabled && !applied) return baseEdges;
    return proposedEdges;
  }, [enabled, applied, proposedEdges]);

  const state: DiffState = {
    enabled,
    viewMode,
    diff,
    approvals,
    selectedNodeId,
    proposedNodes,
    proposedEdges: activeEdges,
    ghostEdges,
  };

  const actions: DiffActions = {
    enableDiff,
    disableDiff,
    toggleViewMode,
    setSelectedNodeId,
    setApproval,
    acceptAll,
    rejectAll,
    applyApproved,
  };

  return { state, actions };
}
