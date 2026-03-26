import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from './workflow';
import { baseNodes, type ConfigField } from './workflow';

// ── Diff types ──────────────────────────────────────────────

export type ChangeStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export interface NodeChange {
  nodeId: string;
  status: ChangeStatus;
  /** For modified nodes, the original config before changes */
  originalConfig?: ConfigField[];
}

export interface EdgeChange {
  edgeId: string;
  status: ChangeStatus;
}

export interface WorkflowDiff {
  nodeChanges: NodeChange[];
  edgeChanges: EdgeChange[];
}

// ── Approval state ──────────────────────────────────────────

export type ApprovalState = 'pending' | 'accepted' | 'rejected';

export interface ChangeApproval {
  id: string; // nodeId or edgeId
  type: 'node' | 'edge';
  status: ChangeStatus;
  approval: ApprovalState;
}

// ── The mocked "AI-proposed" diff ───────────────────────────

// After the diff is applied, the workflow looks like this:
// Upload → Parse → Extract Fields (modified) → Validate → Cross-Check Registry (new) → Format → Upload to System
// The direct Validate→Format edge is removed, replaced by Validate→Cross-Check→Format

const NODE_WIDTH = 260;
const NODE_GAP = 120;
const START_X = 80;
const START_Y = 200;

function nodeX(index: number) {
  return START_X + index * (NODE_WIDTH + NODE_GAP);
}

/** The modified Extract Fields node with additional fields */
const modifiedExtractFields: Node<WorkflowNodeData> = {
  id: 'extract-fields',
  type: 'workflowNode',
  position: { x: nodeX(2), y: START_Y },
  data: {
    label: 'Extract Fields',
    description: 'Party names, dates, values, jurisdiction',
    icon: 'ListChecks',
    status: 'success',
    config: [
      { label: 'Fields', value: 'party_name, date, value, effective_date, jurisdiction' },
      { label: 'Confidence', value: '> 0.85' },
      { label: 'New Fields', value: 'effective_date, jurisdiction' },
    ],
  },
};

/** The new Cross-Check Registry node inserted between Validate and Format */
const crossCheckNode: Node<WorkflowNodeData> = {
  id: 'cross-check-registry',
  type: 'workflowNode',
  // Push Format and Upload to the right to make room
  position: { x: nodeX(4), y: START_Y },
  data: {
    label: 'Cross-Check Registry',
    description: 'Web lookup verification',
    icon: 'Globe',
    status: 'idle',
    config: [
      { label: 'Registry', value: 'SEC EDGAR' },
      { label: 'Match On', value: 'party_name, jurisdiction' },
      { label: 'Timeout', value: '30s' },
    ],
  },
};

/**
 * Build the "proposed" (after-diff) nodes and edges,
 * plus the diff metadata describing what changed.
 */
export function buildProposedWorkflow(): {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  diff: WorkflowDiff;
} {
  // Start from base, apply changes
  const nodes = baseNodes.map((n) => {
    if (n.id === 'extract-fields') return modifiedExtractFields;
    // Shift Format Output and Upload to System right to make room for new node
    if (n.id === 'format-output') return { ...n, position: { x: nodeX(5), y: START_Y } };
    if (n.id === 'upload-to-system') return { ...n, position: { x: nodeX(6), y: START_Y } };
    return n;
  });
  // Insert the new node
  nodes.splice(4, 0, crossCheckNode);

  const edges: Edge[] = [
    // Unchanged edges
    { id: 'e-upload-parse', source: 'upload-contract', target: 'parse-document', type: 'workflow' },
    { id: 'e-parse-extract', source: 'parse-document', target: 'extract-fields', type: 'workflow' },
    { id: 'e-extract-validate', source: 'extract-fields', target: 'validate-data', type: 'workflow' },
    // Removed: e-validate-format (direct Validate→Format) is gone
    // Added: new edges through Cross-Check
    { id: 'e-validate-crosscheck', source: 'validate-data', target: 'cross-check-registry', type: 'workflow' },
    { id: 'e-crosscheck-format', source: 'cross-check-registry', target: 'format-output', type: 'workflow' },
    // Unchanged
    { id: 'e-format-upload', source: 'format-output', target: 'upload-to-system', type: 'workflow' },
  ];

  const originalExtract = baseNodes.find((n) => n.id === 'extract-fields')!;

  const diff: WorkflowDiff = {
    nodeChanges: [
      { nodeId: 'upload-contract', status: 'unchanged' },
      { nodeId: 'parse-document', status: 'unchanged' },
      {
        nodeId: 'extract-fields',
        status: 'modified',
        originalConfig: originalExtract.data.config,
      },
      { nodeId: 'validate-data', status: 'unchanged' },
      { nodeId: 'cross-check-registry', status: 'added' },
      { nodeId: 'format-output', status: 'unchanged' },
      { nodeId: 'upload-to-system', status: 'unchanged' },
    ],
    edgeChanges: [
      { edgeId: 'e-upload-parse', status: 'unchanged' },
      { edgeId: 'e-parse-extract', status: 'unchanged' },
      { edgeId: 'e-extract-validate', status: 'unchanged' },
      { edgeId: 'e-validate-format', status: 'removed' },
      { edgeId: 'e-validate-crosscheck', status: 'added' },
      { edgeId: 'e-crosscheck-format', status: 'added' },
      { edgeId: 'e-format-upload', status: 'unchanged' },
    ],
  };

  return { nodes, edges, diff };
}

/** Get the original "before" edge that was removed (for ghost rendering) */
export const removedEdge: Edge = {
  id: 'e-validate-format',
  source: 'validate-data',
  target: 'format-output',
  type: 'workflow',
};
