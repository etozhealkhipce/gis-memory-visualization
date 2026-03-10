"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ConnectionMode,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MemoryNode, MemoryEdge, STATUS_COLORS, SOURCE_COLORS, EDGE_COLORS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

// Custom node component
function MemoryNodeComponent({ data, selected }: { data: MemoryNode; selected?: boolean }) {
  const statusColor = STATUS_COLORS[data.status];
  const sourceColor = SOURCE_COLORS[data.source];
  
  const statusIcons = {
    trusted: <CheckCircle className="h-2.5 w-2.5" />,
    unverified: <HelpCircle className="h-2.5 w-2.5" />,
    injected: <ShieldAlert className="h-2.5 w-2.5" />,
    conflicting: <AlertTriangle className="h-2.5 w-2.5" />,
  };

  return (
    <div
      className={`min-w-[140px] max-w-[200px] rounded border bg-slate-900/90 p-2 transition-all ${
        selected
          ? "border-cyan-400 shadow-lg shadow-cyan-500/20"
          : data.status === "injected"
          ? "pulse-injected border-red-500"
          : "border-slate-600 hover:border-slate-500"
      }`}
      style={{
        borderColor: selected ? undefined : statusColor,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-2 !h-2" />
      
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <h4 className="truncate text-[10px] font-bold text-slate-200">{data.title}</h4>
          <p className="mt-0.5 line-clamp-2 text-[9px] text-slate-400 leading-tight">{data.content}</p>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span
            className="flex h-3 w-3 items-center justify-center rounded"
            style={{ color: statusColor }}
          >
            {statusIcons[data.status]}
          </span>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: sourceColor }}
            title={`Source: ${data.source}`}
          />
        </div>
        <span className="text-[9px] text-slate-500">{data.trustScore}%</span>
      </div>

      {data.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-0.5">
          {data.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-slate-700 px-1 py-0 text-[7px] text-slate-500 h-3.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  memory: MemoryNodeComponent,
};

interface MemoryGraphProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  selectedNodeId: string | null;
  activeMemoryIds: string[];
  onNodeSelect: (nodeId: string | null) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
}

export function MemoryGraph({
  nodes,
  edges,
  selectedNodeId,
  activeMemoryIds,
  onNodeSelect,
  onNodePositionChange,
}: MemoryGraphProps) {
  // Convert to React Flow format
  const initialNodes = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "memory",
        position: node.position || { x: Math.random() * 300, y: Math.random() * 200 },
        data: node as unknown as Record<string, unknown>,
        selected: node.id === selectedNodeId,
        className: activeMemoryIds.includes(node.id) ? "ring-2 ring-cyan-400" : undefined,
      })),
    [nodes, selectedNodeId, activeMemoryIds]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.type,
        type: "smoothstep",
        animated: edge.type === "contradicts",
        style: {
          stroke: EDGE_COLORS[edge.type],
          strokeWidth: 1.5,
        },
        labelStyle: {
          fill: EDGE_COLORS[edge.type],
          fontSize: 8,
          fontFamily: "monospace",
        },
        markerEnd: {
          type: "arrowclosed" as const,
          color: EDGE_COLORS[edge.type],
        },
      })),
    [edges]
  );

  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when props change
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id === selectedNodeId ? null : node.id);
    },
    [onNodeSelect, selectedNodeId]
  );

  // Handle node drag stop - save position
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodePositionChange) {
        onNodePositionChange(node.id, node.position);
      }
    },
    [onNodePositionChange]
  );

  return (
    <div className="h-full w-full rounded border border-slate-700/50 bg-slate-950/50">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="rgba(0, 255, 255, 0.1)"
          gap={30}
          size={1}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 rounded border border-slate-700/50 bg-slate-900/90 p-2 text-[9px]">
        <div className="mb-1 font-bold text-slate-400">СТАТУС</div>
        <div className="space-y-0.5">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize text-slate-500 text-[8px]">{status}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 mb-1 font-bold text-slate-400">ИСТОЧНИК</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {Object.entries(SOURCE_COLORS).map(([source, color]) => (
            <div key={source} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[7px] text-slate-500">{source}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Need to import React for useEffect
import React from "react";
