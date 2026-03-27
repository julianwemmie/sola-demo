import { useState, useCallback, useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData, ConfigField } from '@/data/workflow';
import {
  initialVersions,
  computeVersionDiff,
  type WorkflowVersion,
  type VersionDiff,
  type ChangeStatus,
} from '@/data/versions';

// ── Layout helpers for adding nodes ────────────────────────

const NODE_WIDTH = 260;
const NODE_GAP = 120;
const START_X = 80;
const START_Y = 200;

function nodeX(index: number) {
  return START_X + index * (NODE_WIDTH + NODE_GAP);
}

// ── State types ────────────────────────────────────────────

export type AppMode =
  | { type: 'editing' }
  | { type: 'previewing'; versionId: string }
  | { type: 'comparing'; versionId: string };

export interface VersionState {
  versions: WorkflowVersion[];
  currentVersionId: string;
  workingNodes: Node<WorkflowNodeData>[];
  workingEdges: Edge[];
  mode: AppMode;
  hasUncommittedChanges: boolean;
  historyOpen: boolean;
  /** When comparing, the diff + annotated nodes/edges for the canvas */
  compareDiff: VersionDiff | null;
  compareNodes: Node<WorkflowNodeData>[];
  compareEdges: Edge[];
  compareGhostEdges: Edge[];
  /** The nodes/edges currently displayed on the canvas */
  displayNodes: Node<WorkflowNodeData>[];
  displayEdges: Edge[];
  /** Editing state */
  editingNodeId: string | null;
  /** Compare view mode (used in both compare and staging overlay) */
  compareViewMode: 'inline' | 'side-by-side';
  /** The compared version (for side-by-side compare) */
  compareVersion: WorkflowVersion | null;
  /** Staging diff (committed vs working) — always computed when there are changes */
  stagingDiff: VersionDiff | null;
  stagingNodes: Node<WorkflowNodeData>[];
  stagingEdges: Edge[];
  stagingGhostEdges: Edge[];
  /** Whether the changes list sidebar is open */
  changesListOpen: boolean;
}

export interface VersionActions {
  toggleHistory: () => void;
  previewVersion: (versionId: string) => void;
  stopPreview: () => void;
  compareVersion: (versionId: string) => void;
  stopCompare: () => void;
  restoreVersion: (versionId: string) => void;
  confirmCommit: (summary?: string) => void;
  revertNodeChange: (nodeId: string) => void;
  revertEdgeChange: (edgeId: string) => void;
  toggleCompareViewMode: () => void;
  toggleChangesList: () => void;
  // Editing
  updateNodeConfig: (nodeId: string, config: ConfigField[]) => void;
  updateNodeLabel: (nodeId: string, label: string, description: string) => void;
  addNode: (afterNodeId: string, edgeId: string) => void;
  deleteNode: (nodeId: string) => void;
  setEditingNodeId: (nodeId: string | null) => void;
  // For React Flow drag handling
  setWorkingNodes: (nodes: Node<WorkflowNodeData>[]) => void;
}

export function useVersionState() {
  const [versions, setVersions] = useState<WorkflowVersion[]>(initialVersions);
  const [currentVersionId, setCurrentVersionId] = useState('v3');
  const [workingNodes, setWorkingNodes] = useState<Node<WorkflowNodeData>[]>(
    () => initialVersions[2].nodes.map((n) => ({ ...n, data: { ...n.data } })),
  );
  const [workingEdges, setWorkingEdges] = useState<Edge[]>(
    () => initialVersions[2].edges.map((e) => ({ ...e })),
  );
  const [mode, setMode] = useState<AppMode>({ type: 'editing' });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [compareViewMode, setCompareViewMode] = useState<'inline' | 'side-by-side'>('inline');
  const [changesListOpen, setChangesListOpen] = useState(false);

  // Current committed version
  const currentVersion = useMemo(
    () => versions.find((v) => v.id === currentVersionId)!,
    [versions, currentVersionId],
  );

  // Detect uncommitted changes
  const hasUncommittedChanges = useMemo(() => {
    const committed = currentVersion;
    if (workingNodes.length !== committed.nodes.length) return true;
    if (workingEdges.length !== committed.edges.length) return true;
    for (const wn of workingNodes) {
      const cn = committed.nodes.find((n) => n.id === wn.id);
      if (!cn) return true;
      if (JSON.stringify(cn.data.config) !== JSON.stringify(wn.data.config)) return true;
      if (cn.data.label !== wn.data.label) return true;
      if (cn.data.description !== wn.data.description) return true;
    }
    for (const we of workingEdges) {
      if (!committed.edges.find((e) => e.id === we.id)) return true;
    }
    return false;
  }, [workingNodes, workingEdges, currentVersion]);

  // ── Compare mode computed state ──────────────────────────

  const compareDiff = useMemo(() => {
    if (mode.type !== 'comparing') return null;
    const compareVersion = versions.find((v) => v.id === mode.versionId);
    if (!compareVersion) return null;
    return computeVersionDiff(compareVersion, currentVersion);
  }, [mode, versions, currentVersion]);

  const compareNodes = useMemo<Node<WorkflowNodeData>[]>(() => {
    if (mode.type !== 'comparing' || !compareDiff) return [];
    const changeMap = new Map(compareDiff.nodeChanges.map((c) => [c.nodeId, c]));

    const nodes = currentVersion.nodes.map((node) => {
      const change = changeMap.get(node.id);
      return {
        ...node,
        data: {
          ...node.data,
          changeStatus: change?.status ?? ('unchanged' as ChangeStatus),
          originalConfig: change?.originalConfig,
        },
      };
    });

    const compareVersion = versions.find((v) => v.id === (mode as { versionId: string }).versionId)!;
    for (const change of compareDiff.nodeChanges) {
      if (change.status === 'removed') {
        const removedNode = compareVersion.nodes.find((n) => n.id === change.nodeId);
        if (removedNode) {
          nodes.push({
            ...removedNode,
            draggable: false,
            selectable: false,
            data: {
              ...removedNode.data,
              changeStatus: 'removed' as ChangeStatus,
            },
          });
        }
      }
    }

    return nodes;
  }, [mode, compareDiff, currentVersion, versions]);

  const compareEdges = useMemo<Edge[]>(() => {
    if (mode.type !== 'comparing' || !compareDiff) return [];
    const edgeChangeMap = new Map(compareDiff.edgeChanges.map((c) => [c.edgeId, c.status]));
    return currentVersion.edges.map((edge) => ({
      ...edge,
      data: { changeStatus: edgeChangeMap.get(edge.id) ?? 'unchanged' },
    }));
  }, [mode, compareDiff, currentVersion]);

  const compareGhostEdges = useMemo<Edge[]>(() => {
    if (mode.type !== 'comparing' || !compareDiff) return [];
    const compareVersion = versions.find((v) => v.id === (mode as { versionId: string }).versionId)!;
    return compareDiff.edgeChanges
      .filter((c) => c.status === 'removed')
      .map((c) => {
        const edge = compareVersion.edges.find((e) => e.id === c.edgeId)!;
        return { ...edge, data: { changeStatus: 'removed' as ChangeStatus } };
      });
  }, [mode, compareDiff, versions]);

  // ── Staging computed state (always computed when changes exist) ──

  const stagingDiff = useMemo(() => {
    if (!hasUncommittedChanges) return null;
    const workingVersion: WorkflowVersion = {
      id: '_working',
      label: '',
      date: '',
      summary: '',
      nodes: workingNodes,
      edges: workingEdges,
    };
    return computeVersionDiff(currentVersion, workingVersion);
  }, [hasUncommittedChanges, currentVersion, workingNodes, workingEdges]);

  const stagingNodes = useMemo<Node<WorkflowNodeData>[]>(() => {
    if (!stagingDiff) return [];
    const changeMap = new Map(stagingDiff.nodeChanges.map((c) => [c.nodeId, c]));

    const nodes = workingNodes.map((node) => {
      const change = changeMap.get(node.id);
      return {
        ...node,
        data: {
          ...node.data,
          changeStatus: change?.status ?? ('unchanged' as ChangeStatus),
          originalConfig: change?.originalConfig,
        },
      };
    });

    for (const change of stagingDiff.nodeChanges) {
      if (change.status === 'removed') {
        const removedNode = currentVersion.nodes.find((n) => n.id === change.nodeId);
        if (removedNode) {
          nodes.push({
            ...removedNode,
            draggable: false,
            selectable: false,
            data: {
              ...removedNode.data,
              changeStatus: 'removed' as ChangeStatus,
            },
          });
        }
      }
    }

    return nodes;
  }, [stagingDiff, workingNodes, currentVersion]);

  const stagingEdges = useMemo<Edge[]>(() => {
    if (!stagingDiff) return [];
    const edgeChangeMap = new Map(stagingDiff.edgeChanges.map((c) => [c.edgeId, c.status]));
    return workingEdges.map((edge) => ({
      ...edge,
      data: { changeStatus: edgeChangeMap.get(edge.id) ?? 'unchanged' },
    }));
  }, [stagingDiff, workingEdges]);

  const stagingGhostEdges = useMemo<Edge[]>(() => {
    if (!stagingDiff) return [];
    return stagingDiff.edgeChanges
      .filter((c) => c.status === 'removed')
      .map((c) => {
        const edge = currentVersion.edges.find((e) => e.id === c.edgeId)!;
        return { ...edge, data: { changeStatus: 'removed' as ChangeStatus } };
      });
  }, [stagingDiff, currentVersion]);

  // ── Display nodes/edges (what the canvas renders) ────────

  const displayNodes = useMemo<Node<WorkflowNodeData>[]>(() => {
    if (mode.type === 'previewing') {
      const previewVersion = versions.find((v) => v.id === mode.versionId);
      return previewVersion?.nodes ?? workingNodes;
    }
    if (mode.type === 'comparing') {
      return compareNodes;
    }
    // Editing mode: show staging annotations if there are uncommitted changes
    if (hasUncommittedChanges && stagingNodes.length > 0) {
      return stagingNodes;
    }
    return workingNodes;
  }, [mode, versions, workingNodes, compareNodes, hasUncommittedChanges, stagingNodes]);

  const displayEdges = useMemo<Edge[]>(() => {
    if (mode.type === 'previewing') {
      const previewVersion = versions.find((v) => v.id === mode.versionId);
      return previewVersion?.edges ?? workingEdges;
    }
    if (mode.type === 'comparing') {
      return [...compareEdges, ...compareGhostEdges];
    }
    // Editing mode: show staging annotations if there are uncommitted changes
    if (hasUncommittedChanges && stagingEdges.length > 0) {
      return [...stagingEdges, ...stagingGhostEdges];
    }
    return workingEdges;
  }, [mode, versions, workingEdges, compareEdges, compareGhostEdges, hasUncommittedChanges, stagingEdges, stagingGhostEdges]);

  // ── Actions ──────────────────────────────────────────────

  const toggleHistory = useCallback(() => {
    setHistoryOpen((h) => !h);
  }, []);

  const previewVersion = useCallback((versionId: string) => {
    setEditingNodeId(null);
    setMode({ type: 'previewing', versionId });
  }, []);

  const stopPreview = useCallback(() => {
    setMode({ type: 'editing' });
  }, []);

  const toggleCompareViewMode = useCallback(() => {
    setCompareViewMode((m) => (m === 'inline' ? 'side-by-side' : 'inline'));
  }, []);

  const toggleChangesList = useCallback(() => {
    setChangesListOpen((o) => !o);
  }, []);

  const compareVersion = useCallback((versionId: string) => {
    setEditingNodeId(null);
    setCompareViewMode('inline');
    setMode({ type: 'comparing', versionId });
  }, []);

  const stopCompare = useCallback(() => {
    setMode({ type: 'editing' });
  }, []);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return;

    const newId = `v${versions.length + 1}`;
    const newVersion: WorkflowVersion = {
      id: newId,
      label: newId,
      date: new Date().toISOString().split('T')[0],
      summary: `Restored from ${version.label}`,
      nodes: version.nodes.map((n) => ({ ...n, data: { ...n.data } })),
      edges: version.edges.map((e) => ({ ...e })),
    };

    setVersions((prev) => [...prev, newVersion]);
    setCurrentVersionId(newId);
    setWorkingNodes(newVersion.nodes.map((n) => ({ ...n, data: { ...n.data } })));
    setWorkingEdges(newVersion.edges.map((e) => ({ ...e })));
    setMode({ type: 'editing' });
    setEditingNodeId(null);
  }, [versions]);

  const confirmCommit = useCallback((summary?: string) => {
    const newId = `v${versions.length + 1}`;
    const autoSummary = summary || generateCommitSummary(currentVersion, workingNodes, workingEdges);
    const newVersion: WorkflowVersion = {
      id: newId,
      label: newId,
      date: new Date().toISOString().split('T')[0],
      summary: autoSummary,
      nodes: workingNodes.map((n) => {
        const { changeStatus, originalConfig, approvalState, ...cleanData } = n.data as Record<string, unknown>;
        return { ...n, data: cleanData as WorkflowNodeData };
      }),
      edges: workingEdges.map((e) => {
        const { data, ...rest } = e;
        return rest;
      }),
    };

    setVersions((prev) => [...prev, newVersion]);
    setCurrentVersionId(newId);
  }, [versions, currentVersion, workingNodes, workingEdges]);

  // Revert a single node change back to its committed state
  const revertNodeChange = useCallback((nodeId: string) => {
    const committedNode = currentVersion.nodes.find((n) => n.id === nodeId);
    const workingNode = workingNodes.find((n) => n.id === nodeId);

    if (workingNode && !committedNode) {
      // Node was added — remove it and bridge its edges
      const inEdge = workingEdges.find((e) => e.target === nodeId);
      const outEdge = workingEdges.find((e) => e.source === nodeId);
      setWorkingEdges((prev) => {
        const filtered = prev.filter((e) => e.source !== nodeId && e.target !== nodeId);
        if (inEdge && outEdge) {
          filtered.push({
            id: `e-${inEdge.source}-${outEdge.target}`,
            source: inEdge.source,
            target: outEdge.target,
            type: 'workflow',
          });
        }
        return filtered;
      });
      setWorkingNodes((prev) => prev.filter((n) => n.id !== nodeId));
    } else if (committedNode && !workingNode) {
      // Node was removed — restore it and its edges, remove the bridge edge
      const committedEdgesForNode = currentVersion.edges.filter(
        (e) => e.source === nodeId || e.target === nodeId,
      );
      // Find the bridge edge: connects the neighbors that were linked when this node was deleted
      const inEdge = committedEdgesForNode.find((e) => e.target === nodeId);
      const outEdge = committedEdgesForNode.find((e) => e.source === nodeId);

      setWorkingNodes((prev) => [...prev, { ...committedNode, data: { ...committedNode.data } }]);
      setWorkingEdges((prev) => {
        let filtered = prev;
        // Remove the bridge edge that spans across the deleted node
        if (inEdge && outEdge) {
          filtered = filtered.filter(
            (e) => !(e.source === inEdge.source && e.target === outEdge.target),
          );
        }
        // Remove any edges with same IDs as committed (avoid duplicates), then add committed edges back
        const committedIds = new Set(committedEdgesForNode.map((e) => e.id));
        filtered = filtered.filter((e) => !committedIds.has(e.id));
        return [...filtered, ...committedEdgesForNode];
      });
    } else if (committedNode && workingNode) {
      // Node was modified — restore committed data
      setWorkingNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...committedNode.data } }
            : n,
        ),
      );
    }
  }, [currentVersion, workingNodes, workingEdges]);

  // Revert a single edge change back to its committed state
  const revertEdgeChange = useCallback((edgeId: string) => {
    const committedEdge = currentVersion.edges.find((e) => e.id === edgeId);
    const workingEdge = workingEdges.find((e) => e.id === edgeId);

    if (workingEdge && !committedEdge) {
      setWorkingEdges((prev) => prev.filter((e) => e.id !== edgeId));
    } else if (committedEdge && !workingEdge) {
      setWorkingEdges((prev) => [...prev, { ...committedEdge }]);
    }
  }, [currentVersion, workingEdges]);

  // ── Editing actions ──────────────────────────────────────

  const updateNodeConfig = useCallback((nodeId: string, config: ConfigField[]) => {
    setWorkingNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config } } : n,
      ),
    );
  }, []);

  const updateNodeLabel = useCallback((nodeId: string, label: string, description: string) => {
    setWorkingNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label, description } } : n,
      ),
    );
  }, []);

  const addNode = useCallback((afterNodeId: string, edgeId: string) => {
    setWorkingNodes((prev) => {
      const edge = workingEdges.find((e) => e.id === edgeId);
      if (!edge) return prev;

      const sourceIdx = prev.findIndex((n) => n.id === edge.source);
      const targetIdx = prev.findIndex((n) => n.id === edge.target);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const insertIdx = sourceIdx + 1;
      const newNodeId = `node-${Date.now()}`;

      const updated = prev.map((n, i) => {
        if (i >= insertIdx) {
          return { ...n, position: { ...n.position, x: n.position.x + NODE_WIDTH + NODE_GAP } };
        }
        return n;
      });

      const newNode: Node<WorkflowNodeData> = {
        id: newNodeId,
        type: 'workflowNode',
        position: { x: prev[sourceIdx].position.x + NODE_WIDTH + NODE_GAP, y: START_Y },
        data: {
          label: 'New Step',
          description: 'Configure this step',
          icon: 'CircleDot',
          status: 'idle',
          config: [{ label: 'Type', value: 'Custom' }],
        },
      };

      updated.splice(insertIdx, 0, newNode);

      setWorkingEdges((prevEdges) => {
        const filtered = prevEdges.filter((e) => e.id !== edgeId);
        return [
          ...filtered,
          { id: `e-${edge.source}-${newNodeId}`, source: edge.source, target: newNodeId, type: 'workflow' },
          { id: `e-${newNodeId}-${edge.target}`, source: newNodeId, target: edge.target, type: 'workflow' },
        ];
      });

      return updated;
    });
  }, [workingEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    setWorkingNodes((prev) => {
      // If node doesn't exist, no-op (prevents double-delete)
      if (!prev.find((n) => n.id === nodeId)) return prev;

      // Use latest edge state via callback to avoid stale closures
      setWorkingEdges((prevEdges) => {
        const inEdge = prevEdges.find((e) => e.target === nodeId);
        const outEdge = prevEdges.find((e) => e.source === nodeId);
        const filtered = prevEdges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        if (inEdge && outEdge) {
          filtered.push({
            id: `e-${inEdge.source}-${outEdge.target}`,
            source: inEdge.source,
            target: outEdge.target,
            type: 'workflow',
          });
        }
        return filtered;
      });

      return prev.filter((n) => n.id !== nodeId);
    });

    if (editingNodeId === nodeId) {
      setEditingNodeId(null);
    }
  }, [editingNodeId]);

  // ── Compose state & actions ──────────────────────────────

  const state: VersionState = {
    versions,
    currentVersionId,
    workingNodes,
    workingEdges,
    mode,
    hasUncommittedChanges,
    historyOpen,
    compareDiff,
    compareNodes,
    compareEdges,
    compareGhostEdges,
    displayNodes,
    displayEdges,
    editingNodeId,
    compareViewMode,
    compareVersion: mode.type === 'comparing'
      ? versions.find((v) => v.id === mode.versionId) ?? null
      : null,
    stagingDiff,
    stagingNodes,
    stagingEdges,
    stagingGhostEdges,
    changesListOpen,
  };

  const actions: VersionActions = {
    toggleHistory,
    previewVersion,
    stopPreview,
    compareVersion,
    stopCompare,
    restoreVersion,
    confirmCommit,
    revertNodeChange,
    revertEdgeChange,
    toggleCompareViewMode,
    toggleChangesList,
    updateNodeConfig,
    updateNodeLabel,
    addNode,
    deleteNode,
    setEditingNodeId,
    setWorkingNodes,
  };

  return { state, actions };
}

// ── Helpers ────────────────────────────────────────────────

function generateCommitSummary(
  committed: WorkflowVersion,
  workingNodes: Node<WorkflowNodeData>[],
  workingEdges: Edge[],
): string {
  const addedNodes = workingNodes.filter(
    (n) => !committed.nodes.find((cn) => cn.id === n.id),
  );
  const removedNodes = committed.nodes.filter(
    (n) => !workingNodes.find((wn) => wn.id === n.id),
  );
  const modifiedNodes = workingNodes.filter((n) => {
    const cn = committed.nodes.find((cn) => cn.id === n.id);
    if (!cn) return false;
    return JSON.stringify(cn.data.config) !== JSON.stringify(n.data.config) ||
      cn.data.label !== n.data.label;
  });

  const parts: string[] = [];
  if (addedNodes.length) parts.push(`Added ${addedNodes.map((n) => n.data.label).join(', ')}`);
  if (removedNodes.length) parts.push(`Removed ${removedNodes.map((n) => n.data.label).join(', ')}`);
  if (modifiedNodes.length) parts.push(`Updated ${modifiedNodes.map((n) => n.data.label).join(', ')}`);

  return parts.join('; ') || 'Minor changes';
}
