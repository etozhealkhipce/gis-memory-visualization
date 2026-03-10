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
  NodeProps,
  Handle,
  Position,
  ConnectionMode,
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
    trusted: <CheckCircle className="h-3 w-3" />,
    unverified: <HelpCircle className="h-3 w-3" />,
    injected: <ShieldAlert className="h-3 w-3" />,
    conflicting: <AlertTriangle className="h-3 w-3" />,
  };

  return (
    <div
      className={`min-w-[180px] max-w-[240px] rounded border bg-slate-900/90 p-3 transition-all ${
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
      <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="truncate text-xs font-bold text-slate-200">{data.title}</h4>
          <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">{data.content}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span
            className="flex h-4 w-4 items-center justify-center rounded"
            style={{ color: statusColor }}
          >
            {statusIcons[data.status]}
          </span>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: sourceColor }}
            title={`Source: ${data.source}`}
          />
        </div>
        <span className="text-[10px] text-slate-500">{data.trustScore}%</span>
      </div>

      {data.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-slate-700 px-1 py-0 text-[8px] text-slate-500"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
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
}

export function MemoryGraph({
  nodes,
  edges,
  selectedNodeId,
  activeMemoryIds,
  onNodeSelect,
}: MemoryGraphProps) {
  // Convert to React Flow format
  const initialNodes = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "memory",
        position: node.position || { x: Math.random() * 400, y: Math.random() * 300 },
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
          strokeWidth: 2,
        },
        labelStyle: {
          fill: EDGE_COLORS[edge.type],
          fontSize: 10,
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

  return (
    <div className="h-full w-full rounded border border-slate-700/50 bg-slate-950/50">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="rgba(0, 255, 255, 0.1)"
          gap={40}
          size={1}
        />
        <Controls className="!bg-slate-900/80 !border-slate-700" />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded border border-slate-700/50 bg-slate-900/90 p-3 text-[10px]">
        <div className="mb-2 font-bold text-slate-400">STATUS</div>
        <div className="space-y-1">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize text-slate-500">{status}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 mb-2 font-bold text-slate-400">SOURCE</div>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(SOURCE_COLORS).map(([source, color]) => (
            <div key={source} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-slate-500">{source}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Need to import React for useEffect
import React from "react";
