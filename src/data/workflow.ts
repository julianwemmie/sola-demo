import type { Node, Edge } from '@xyflow/react';

export interface WorkflowNodeData {
  label: string;
  description: string;
  icon: string;
  status: 'idle' | 'success' | 'error';
  config: { label: string; value: string }[];
  [key: string]: unknown;
}

const NODE_WIDTH = 260;
const NODE_GAP = 120;
const START_X = 80;
const START_Y = 200;

function nodeX(index: number) {
  return START_X + index * (NODE_WIDTH + NODE_GAP);
}

export const baseNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'upload-contract',
    type: 'workflowNode',
    position: { x: nodeX(0), y: START_Y },
    data: {
      label: 'Upload Contract',
      description: 'PDF input',
      icon: 'FileUp',
      status: 'success',
      config: [
        { label: 'Source', value: 'Client Portal' },
        { label: 'Format', value: 'PDF' },
        { label: 'Max Size', value: '25 MB' },
      ],
    },
  },
  {
    id: 'parse-document',
    type: 'workflowNode',
    position: { x: nodeX(1), y: START_Y },
    data: {
      label: 'Parse Document',
      description: 'OCR / extraction',
      icon: 'ScanText',
      status: 'success',
      config: [
        { label: 'Engine', value: 'GPT-4o Vision' },
        { label: 'Pages', value: 'All' },
        { label: 'Language', value: 'English' },
      ],
    },
  },
  {
    id: 'extract-fields',
    type: 'workflowNode',
    position: { x: nodeX(2), y: START_Y },
    data: {
      label: 'Extract Fields',
      description: 'Party names, dates, values',
      icon: 'ListChecks',
      status: 'success',
      config: [
        { label: 'Fields', value: 'party_name, date, value' },
        { label: 'Confidence', value: '> 0.85' },
      ],
    },
  },
  {
    id: 'validate-data',
    type: 'workflowNode',
    position: { x: nodeX(3), y: START_Y },
    data: {
      label: 'Validate Data',
      description: 'Check required fields',
      icon: 'ShieldCheck',
      status: 'success',
      config: [
        { label: 'Rules', value: '12 validations' },
        { label: 'On Fail', value: 'Flag for review' },
      ],
    },
  },
  {
    id: 'format-output',
    type: 'workflowNode',
    position: { x: nodeX(4), y: START_Y },
    data: {
      label: 'Format Output',
      description: 'Structure for downstream',
      icon: 'Braces',
      status: 'success',
      config: [
        { label: 'Schema', value: 'ContractV2' },
        { label: 'Format', value: 'JSON' },
      ],
    },
  },
  {
    id: 'upload-to-system',
    type: 'workflowNode',
    position: { x: nodeX(5), y: START_Y },
    data: {
      label: 'Upload to System',
      description: 'API call',
      icon: 'CloudUpload',
      status: 'success',
      config: [
        { label: 'Target', value: 'DocuVault API' },
        { label: 'Method', value: 'POST' },
        { label: 'Retry', value: '3x' },
      ],
    },
  },
];

export const baseEdges: Edge[] = [
  { id: 'e-upload-parse', source: 'upload-contract', target: 'parse-document', type: 'workflow' },
  { id: 'e-parse-extract', source: 'parse-document', target: 'extract-fields', type: 'workflow' },
  { id: 'e-extract-validate', source: 'extract-fields', target: 'validate-data', type: 'workflow' },
  { id: 'e-validate-format', source: 'validate-data', target: 'format-output', type: 'workflow' },
  { id: 'e-format-upload', source: 'format-output', target: 'upload-to-system', type: 'workflow' },
];
