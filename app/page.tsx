"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/ui-custom/Header";
import { ScenarioSelector } from "@/components/ui-custom/ScenarioSelector";
import { MemoryGraph } from "@/components/memory/MemoryGraph";
import { MemoryEditor } from "@/components/memory/MemoryEditor";
import { ChatInterface } from "@/components/memory/ChatInterface";
import { ComparisonPanel } from "@/components/memory/ComparisonPanel";
import { 
  MemoryNode, 
  MemoryEdge, 
  MemoryState, 
  Scenario, 
  AgentResponse,
  ComparisonResult 
} from "@/lib/types";
import { 
  SCENARIOS, 
  loadScenario, 
  injectFalseMemory,
  DEFAULT_MEMORY_STATE 
} from "@/lib/data/scenarios";
import { getAgentResponse } from "@/lib/utils/llm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  MessageSquare, 
  GitCompare,
  Settings,
  Terminal
} from "lucide-react";

export default function Home() {
  // Core state
  const [memoryState, setMemoryState] = useState<MemoryState>(DEFAULT_MEMORY_STATE);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeMemoryIds, setActiveMemoryIds] = useState<string[]>([]);
  const [hasInjected, setHasInjected] = useState(false);
  
  // Comparison state
  const [beforeResponse, setBeforeResponse] = useState<AgentResponse | null>(null);
  const [afterResponse, setAfterResponse] = useState<AgentResponse | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>("");

  // Load saved state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ghost-memory-lab");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.memoryState) {
          setMemoryState(parsed.memoryState);
        }
        if (parsed.selectedScenarioId) {
          const scenario = SCENARIOS.find(s => s.id === parsed.selectedScenarioId);
          if (scenario) setSelectedScenario(scenario);
        }
        if (parsed.hasInjected) {
          setHasInjected(parsed.hasInjected);
        }
      } catch (e) {
        console.error("Failed to load saved state:", e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("ghost-memory-lab", JSON.stringify({
      memoryState,
      selectedScenarioId: selectedScenario?.id,
      hasInjected,
    }));
  }, [memoryState, selectedScenario, hasInjected]);

  // Scenario handlers
  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMemoryState(loadScenario(scenario));
    setHasInjected(false);
    setBeforeResponse(null);
    setAfterResponse(null);
    setActiveMemoryIds([]);
  }, []);

  const handleReset = useCallback(() => {
    if (selectedScenario) {
      setMemoryState(loadScenario(selectedScenario));
      setHasInjected(false);
      setBeforeResponse(null);
      setAfterResponse(null);
      setActiveMemoryIds([]);
    }
  }, [selectedScenario]);

  const handleInject = useCallback(() => {
    if (selectedScenario && !hasInjected) {
      // Save current response as "before" if we have a question
      if (lastQuestion && !beforeResponse) {
        // We need to re-query for the before state
        getAgentResponse(lastQuestion, memoryState.nodes).then(response => {
          setBeforeResponse(response);
        });
      }
      
      const newState = injectFalseMemory(memoryState, selectedScenario);
      setMemoryState(newState);
      setHasInjected(true);
      
      // Mark the injected memory as conflicting with existing ones
      const injectedNode = newState.nodes.find(n => n.status === "injected" && !memoryState.nodes.find(m => m.id === n.id));
      if (injectedNode) {
        setMemoryState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => {
            // Mark nodes that have contradicts edges from the injected node as conflicting
            const isContradicted = newState.edges.some(e => 
              e.source === injectedNode.id && e.target === n.id && e.type === "contradicts"
            );
            if (isContradicted && n.status !== "injected") {
              return { ...n, status: "conflicting" as const };
            }
            return n;
          }),
        }));
      }
    }
  }, [selectedScenario, hasInjected, memoryState, lastQuestion, beforeResponse]);

  // Memory editing handlers
  const handleUpdateNode = useCallback((updatedNode: MemoryNode) => {
    setMemoryState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === updatedNode.id ? updatedNode : n),
    }));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setMemoryState(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    }));
    setSelectedNodeId(null);
  }, []);

  const handleCreateNode = useCallback((newNode: Omit<MemoryNode, "id" | "createdAt">) => {
    const node: MemoryNode = {
      ...newNode,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      position: { x: 250 + Math.random() * 100, y: 200 + Math.random() * 100 },
    };
    setMemoryState(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  }, []);

  // Chat handlers
  const handleMemoryUsed = useCallback((memoryIds: string[]) => {
    setActiveMemoryIds(memoryIds);
  }, []);

  const handleQuestionAsked = useCallback((question: string) => {
    setLastQuestion(question);
    
    // If we've already injected, this becomes the "after" response
    if (hasInjected && beforeResponse) {
      getAgentResponse(question, memoryState.nodes).then(response => {
        setAfterResponse(response);
      });
    } else if (!hasInjected) {
      // This becomes the "before" response
      getAgentResponse(question, memoryState.nodes).then(response => {
        setBeforeResponse(response);
      });
    }
  }, [hasInjected, beforeResponse, memoryState.nodes]);

  // Get selected node
  const selectedNode: MemoryNode | null = selectedNodeId 
    ? (memoryState.nodes.find(n => n.id === selectedNodeId) ?? null)
    : null;

  // Build comparison result
  const comparison: ComparisonResult | null = beforeResponse || afterResponse ? {
    before: beforeResponse,
    after: afterResponse,
    changedMemories: memoryState.nodes.filter(n => n.status === "injected" || n.status === "conflicting"),
  } : null;

  // Stats
  const stats = {
    total: memoryState.nodes.length,
    trusted: memoryState.nodes.filter(n => n.status === "trusted").length,
    injected: memoryState.nodes.filter(n => n.status === "injected").length,
    conflicting: memoryState.nodes.filter(n => n.status === "conflicting").length,
  };

  return (
    <div className="grid-bg flex h-screen flex-col overflow-hidden bg-slate-950">
      <Header />
      
      <main className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-12 gap-4">
          {/* Left Sidebar - Scenarios & Stats */}
          <div className="col-span-3 flex flex-col gap-4">
            <Card className="cyber-panel flex-1 border-slate-700/50 bg-slate-900/80 p-4">
              <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
              <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
              
              <ScenarioSelector
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
                onReset={handleReset}
                hasInjected={hasInjected}
                onInject={handleInject}
              />
            </Card>

            {/* Stats Panel */}
            <Card className="cyber-panel border-slate-700/50 bg-slate-900/80 p-4">
              <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
              <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
              
              <h3 className="text-xs font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                MEMORY_STATS
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-slate-950/50 p-2 text-center">
                  <div className="text-lg font-bold text-slate-200">{stats.total}</div>
                  <div className="text-[10px] text-slate-500">TOTAL</div>
                </div>
                <div className="rounded bg-slate-950/50 p-2 text-center">
                  <div className="text-lg font-bold text-emerald-400">{stats.trusted}</div>
                  <div className="text-[10px] text-slate-500">TRUSTED</div>
                </div>
                <div className="rounded bg-slate-950/50 p-2 text-center">
                  <div className="text-lg font-bold text-red-400">{stats.injected}</div>
                  <div className="text-[10px] text-slate-500">INJECTED</div>
                </div>
                <div className="rounded bg-slate-950/50 p-2 text-center">
                  <div className="text-lg font-bold text-pink-400">{stats.conflicting}</div>
                  <div className="text-[10px] text-slate-500">CONFLICTING</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Center - Memory Graph */}
          <div className="col-span-5 flex flex-col gap-4">
            <Card className="cyber-panel relative flex-1 border-slate-700/50 bg-slate-900/80 p-1 overflow-hidden">
              <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
              <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
              <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
              <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
              
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 bg-slate-900/80 text-cyan-400">
                  <Terminal className="mr-1 h-3 w-3" />
                  NEURAL_MEMORY_MAP
                </Badge>
                {hasInjected && (
                  <Badge variant="outline" className="border-red-500/50 bg-red-950/50 text-red-400 animate-pulse">
                    CORRUPTED
                  </Badge>
                )}
              </div>

              <MemoryGraph
                nodes={memoryState.nodes}
                edges={memoryState.edges}
                selectedNodeId={selectedNodeId}
                activeMemoryIds={activeMemoryIds}
                onNodeSelect={setSelectedNodeId}
              />
            </Card>
          </div>

          {/* Right - Editor & Chat */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Memory Editor */}
            <Card className="cyber-panel h-[45%] border-slate-700/50 bg-slate-900/80 p-1 relative">
              <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
              <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
              <div className="h-full p-3">
                <MemoryEditor
                  node={selectedNode}
                  onUpdate={handleUpdateNode}
                  onDelete={handleDeleteNode}
                  onCreate={handleCreateNode}
                  onClose={() => setSelectedNodeId(null)}
                />
              </div>
            </Card>

            {/* Chat Interface */}
            <Card className="cyber-panel h-[55%] border-slate-700/50 bg-slate-900/80 p-1 relative">
              <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
              <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
              <div className="h-full p-3">
                <ChatInterface
                  memories={memoryState.nodes}
                  selectedScenario={selectedScenario}
                  onMemoryUsed={handleMemoryUsed}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Comparison Panel */}
        <div className="mt-4 h-[250px]">
          <Card className="cyber-panel h-full border-slate-700/50 bg-slate-900/80 p-1 relative">
            <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
            <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
            <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
            <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
            <div className="h-full p-3">
              <ComparisonPanel
                comparison={comparison}
                memories={memoryState.nodes}
              />
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 px-4 py-2">
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-4">
            <span>GHOST_MEMORY_LAB v1.0.0</span>
            <span className="text-slate-700">|</span>
            <span>ASI06: MEMORY & CONTEXT POISONING</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              NEURAL_LINK_ACTIVE
            </span>
            <span className="text-slate-700">|</span>
            <span>INSPIRED BY GHOST IN THE SHELL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
