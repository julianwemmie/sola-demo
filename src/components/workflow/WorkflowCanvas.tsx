import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { baseNodes, baseEdges } from '@/data/workflow';

export function WorkflowCanvas() {
  const nodeTypes: NodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ workflow: WorkflowEdge }), []);
  const [nodes, , onNodesChange] = useNodesState(baseNodes);
  const [edges, , onEdgesChange] = useEdgesState(baseEdges);

  const onInit = useCallback((instance: { fitView: (opts?: Record<string, unknown>) => void }) => {
    setTimeout(() => instance.fitView({ padding: 0.2 }), 50);
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.2 }}
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
