import type { ConfigField } from './workflow';

export interface NodeModification {
  operation: 'add' | 'modify' | 'remove';
  /** For 'add': insert after this node ID */
  afterNodeId?: string;
  /** For 'modify' and 'remove': the target node ID */
  nodeId?: string;
  /** For 'add' and 'modify' */
  label?: string;
  description?: string;
  icon?: string;
  config?: ConfigField[];
}

export interface ProcessingResult {
  transcript: string;
  modifications: NodeModification[];
  summary: string;
}
