import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData, ConfigField } from './workflow';

// ── Version types ──────────────────────────────────────────

export interface WorkflowVersion {
  id: string;
  label: string;
  date: string; // ISO date string
  summary: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

// ── Layout helpers ─────────────────────────────────────────

const NODE_WIDTH = 260;
const NODE_GAP = 120;
const START_X = 80;
const START_Y = 200;

function nodeX(index: number) {
  return START_X + index * (NODE_WIDTH + NODE_GAP);
}

function makeNode(
  id: string,
  index: number,
  data: Omit<WorkflowNodeData, 'status'> & { status?: WorkflowNodeData['status'] },
): Node<WorkflowNodeData> {
  return {
    id,
    type: 'workflowNode',
    position: { x: nodeX(index), y: START_Y },
    data: { status: 'success', ...data } as WorkflowNodeData,
  };
}

function makeEdge(id: string, source: string, target: string): Edge {
  return { id, source, target, type: 'workflow' };
}

// ── v1: Initial workflow (3 nodes) ─────────────────────────

const v1Nodes: Node<WorkflowNodeData>[] = [
  makeNode('upload-contract', 0, {
    label: 'Upload Contract',
    description: 'PDF input',
    icon: 'FileUp',
    config: [
      { label: 'Source', value: 'Client Portal' },
      { label: 'Format', value: 'PDF' },
      { label: 'Max Size', value: '25 MB' },
    ],
  }),
  makeNode('parse-document', 1, {
    label: 'Parse Document',
    description: 'OCR / extraction',
    icon: 'ScanText',
    config: [
      { label: 'Engine', value: 'Claude Opus 4.6' },
      { label: 'Pages', value: 'All' },
      { label: 'Language', value: 'English' },
    ],
  }),
  makeNode('extract-fields', 2, {
    label: 'Extract Fields',
    description: 'Party names, dates, values',
    icon: 'ListChecks',
    config: [
      { label: 'Fields', value: 'party_name, date, value' },
      { label: 'Confidence', value: '> 0.85' },
    ],
  }),
];

const v1Edges: Edge[] = [
  makeEdge('e-upload-parse', 'upload-contract', 'parse-document'),
  makeEdge('e-parse-extract', 'parse-document', 'extract-fields'),
];

// ── v2: Added validation pipeline (6 nodes) ───────────────

const v2Nodes: Node<WorkflowNodeData>[] = [
  makeNode('upload-contract', 0, {
    label: 'Upload Contract',
    description: 'PDF input',
    icon: 'FileUp',
    config: [
      { label: 'Source', value: 'Client Portal' },
      { label: 'Format', value: 'PDF' },
      { label: 'Max Size', value: '25 MB' },
    ],
  }),
  makeNode('parse-document', 1, {
    label: 'Parse Document',
    description: 'OCR / extraction',
    icon: 'ScanText',
    config: [
      { label: 'Engine', value: 'Claude Opus 4.6' },
      { label: 'Pages', value: 'All' },
      { label: 'Language', value: 'English' },
    ],
  }),
  makeNode('extract-fields', 2, {
    label: 'Extract Fields',
    description: 'Party names, dates, values',
    icon: 'ListChecks',
    config: [
      { label: 'Fields', value: 'party_name, date, value' },
      { label: 'Confidence', value: '> 0.85' },
    ],
  }),
  makeNode('validate-data', 3, {
    label: 'Validate Data',
    description: 'Check required fields',
    icon: 'ShieldCheck',
    config: [
      { label: 'Rules', value: '12 validations' },
      { label: 'On Fail', value: 'Flag for review' },
    ],
  }),
  makeNode('format-output', 4, {
    label: 'Format Output',
    description: 'Structure for downstream',
    icon: 'Braces',
    config: [
      { label: 'Schema', value: 'ContractV2' },
      { label: 'Format', value: 'JSON' },
    ],
  }),
  makeNode('upload-to-system', 5, {
    label: 'Upload to System',
    description: 'API call',
    icon: 'CloudUpload',
    config: [
      { label: 'Target', value: 'DocuVault API' },
      { label: 'Method', value: 'POST' },
      { label: 'Retry', value: '3x' },
    ],
  }),
];

const v2Edges: Edge[] = [
  makeEdge('e-upload-parse', 'upload-contract', 'parse-document'),
  makeEdge('e-parse-extract', 'parse-document', 'extract-fields'),
  makeEdge('e-extract-validate', 'extract-fields', 'validate-data'),
  makeEdge('e-validate-format', 'validate-data', 'format-output'),
  makeEdge('e-format-upload', 'format-output', 'upload-to-system'),
];

// ── v3: Tuned confidence + schema bump ─────────────────────

const v3Nodes: Node<WorkflowNodeData>[] = v2Nodes.map((n) => {
  if (n.id === 'extract-fields') {
    return {
      ...n,
      data: {
        ...n.data,
        config: [
          { label: 'Fields', value: 'party_name, date, value' },
          { label: 'Confidence', value: '> 0.90' },
        ],
      },
    };
  }
  if (n.id === 'format-output') {
    return {
      ...n,
      data: {
        ...n.data,
        config: [
          { label: 'Schema', value: 'ContractV3' },
          { label: 'Format', value: 'JSON' },
        ],
      },
    };
  }
  return { ...n };
});
const v3Edges = v2Edges.map((e) => ({ ...e }));

// ── Pre-populated version history ──────────────────────────

export const initialVersions: WorkflowVersion[] = [
  {
    id: 'v1',
    label: 'v1',
    date: '2026-03-15',
    summary: 'Initial workflow',
    nodes: v1Nodes,
    edges: v1Edges,
  },
  {
    id: 'v2',
    label: 'v2',
    date: '2026-03-20',
    summary: 'Added validation pipeline',
    nodes: v2Nodes,
    edges: v2Edges,
  },
  {
    id: 'v3',
    label: 'v3',
    date: '2026-03-26',
    summary: 'Tuned confidence, schema v3',
    nodes: v3Nodes,
    edges: v3Edges,
  },
];

// ── Diff computation ───────────────────────────────────────

export type ChangeStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export interface NodeDiffEntry {
  nodeId: string;
  status: ChangeStatus;
  originalConfig?: ConfigField[];
  originalLabel?: string;
  originalDescription?: string;
}

export interface EdgeDiffEntry {
  edgeId: string;
  status: ChangeStatus;
}

export interface VersionDiff {
  nodeChanges: NodeDiffEntry[];
  edgeChanges: EdgeDiffEntry[];
}

/** Compute a diff: what changed going from `base` to `target`. */
export function computeVersionDiff(
  base: WorkflowVersion,
  target: WorkflowVersion,
): VersionDiff {
  const baseNodeMap = new Map(base.nodes.map((n) => [n.id, n]));
  const targetNodeMap = new Map(target.nodes.map((n) => [n.id, n]));

  const nodeChanges: NodeDiffEntry[] = [];

  // Check all target nodes
  for (const [id, targetNode] of targetNodeMap) {
    const baseNode = baseNodeMap.get(id);
    if (!baseNode) {
      nodeChanges.push({ nodeId: id, status: 'added' });
    } else {
      const configChanged =
        JSON.stringify(baseNode.data.config) !== JSON.stringify(targetNode.data.config) ||
        baseNode.data.label !== targetNode.data.label ||
        baseNode.data.description !== targetNode.data.description;
      if (configChanged) {
        nodeChanges.push({
          nodeId: id,
          status: 'modified',
          originalConfig: baseNode.data.config,
          originalLabel: baseNode.data.label,
          originalDescription: baseNode.data.description,
        });
      } else {
        nodeChanges.push({ nodeId: id, status: 'unchanged' });
      }
    }
  }

  // Check removed nodes (in base but not in target)
  for (const [id] of baseNodeMap) {
    if (!targetNodeMap.has(id)) {
      nodeChanges.push({ nodeId: id, status: 'removed' });
    }
  }

  // Edges
  const baseEdgeSet = new Set(base.edges.map((e) => e.id));
  const targetEdgeSet = new Set(target.edges.map((e) => e.id));

  const edgeChanges: EdgeDiffEntry[] = [];

  for (const edge of target.edges) {
    if (baseEdgeSet.has(edge.id)) {
      edgeChanges.push({ edgeId: edge.id, status: 'unchanged' });
    } else {
      edgeChanges.push({ edgeId: edge.id, status: 'added' });
    }
  }

  for (const edge of base.edges) {
    if (!targetEdgeSet.has(edge.id)) {
      edgeChanges.push({ edgeId: edge.id, status: 'removed' });
    }
  }

  return { nodeChanges, edgeChanges };
}
