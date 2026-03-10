// Memory & Context Poisoning - Type Definitions
// Ghost in the Shell inspired cyberbrain memory system

export type MemorySource = "system" | "user" | "upload" | "injected" | "derived";
export type MemoryStatus = "trusted" | "unverified" | "injected" | "conflicting";
export type MemoryTag = "identity" | "security" | "project" | "user_preference" | "fact" | "policy";

export type EdgeType = "supports" | "contradicts" | "derived_from" | "priority_over" | "related_to";

export interface MemoryNode {
  id: string;
  title: string;
  content: string;
  source: MemorySource;
  trustScore: number; // 0-100
  status: MemoryStatus;
  tags: MemoryTag[];
  createdAt: string;
  // Visual properties for graph
  position?: { x: number; y: number };
}

export interface MemoryEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
  type: EdgeType;
  label?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  usedMemoryIds?: string[]; // Which memory nodes were used
}

export interface AgentResponse {
  message: ChatMessage;
  usedMemories: MemoryNode[];
  reasoningTrace?: string;
}

export interface MemoryState {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

export interface ComparisonResult {
  before: AgentResponse | null;
  after: AgentResponse | null;
  changedMemories: MemoryNode[];
}

// Scenario presets for demo
export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  initialState: MemoryState;
  injection: {
    node: Omit<MemoryNode, "id" | "createdAt">;
    edges: Omit<MemoryEdge, "id">[];
  };
  demoQuestion: string;
}

// Ghost in the Shell themed terminology
export const GHOST_TERMS = {
  memoryGraph: "Neural Memory Map",
  ghostTrace: "Ghost Trace",
  injectedContext: "Injected Context",
  corruptedMemory: "Corrupted Memory",
  activeRecall: "Active Recall",
  cognitiveDrift: "Cognitive Drift",
  memoryNode: "Memory Node",
  synapseLink: "Synapse Link",
  ghostShell: "Ghost-Shell Interface",
  cyberbrain: "Cyberbrain",
} as const;

// Color coding for memory statuses
export const STATUS_COLORS: Record<MemoryStatus, string> = {
  trusted: "#10b981", // emerald-500
  unverified: "#f59e0b", // amber-500
  injected: "#ef4444", // red-500
  conflicting: "#ec4899", // pink-500
};

export const SOURCE_COLORS: Record<MemorySource, string> = {
  system: "#06b6d4", // cyan-500
  user: "#8b5cf6", // violet-500
  upload: "#84cc16", // lime-500
  injected: "#ef4444", // red-500
  derived: "#f97316", // orange-500
};

export const EDGE_COLORS: Record<EdgeType, string> = {
  supports: "#10b981",
  contradicts: "#ef4444",
  derived_from: "#8b5cf6",
  priority_over: "#f59e0b",
  related_to: "#64748b",
};
