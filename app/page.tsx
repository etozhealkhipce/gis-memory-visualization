"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Header } from "@/components/ui-custom/Header";
import { ScenarioSelector } from "@/components/ui-custom/ScenarioSelector";
import { MemoryGraph } from "@/components/memory/MemoryGraph";
import { MemoryEditor } from "@/components/memory/MemoryEditor";
import { ChatInterface } from "@/components/memory/ChatInterface";

import { 
  MemoryNode, 
  MemoryEdge, 
  MemoryState, 
  Scenario
} from "@/lib/types";
import { 
  SCENARIOS, 
  loadScenario, 
  injectFalseMemory,
  DEFAULT_MEMORY_STATE 
} from "@/lib/data/scenarios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  Terminal,
  Monitor
} from "lucide-react";

// Ghost in the Shell Matrix Rain Animation
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "GHOSTSHELLMEMORYCYBERBRAININJECTPOISONASI06";
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ffff';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Random cyan shades
        const opacity = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
        ctx.fillText(char, x, y);
        
        // Reset drop
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 50);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}

// Mobile detection component with Ghost in the Shell animation
function MobileWarning() {
  const [glitchText, setGlitchText] = useState("GHOST_MEMORY_LAB");
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [showContent, setShowContent] = useState(false);
  
  // Boot sequence effect
  useEffect(() => {
    const sequence = [
      "INITIALIZING CYBERBRAIN...",
      "LOADING NEURAL INTERFACE...",
      "DETECTING DEVICE TYPE...",
      "ERROR: MOBILE DEVICE DETECTED",
      "ACCESS DENIED",
      ""
    ];
    
    let delay = 0;
    sequence.forEach((line, index) => {
      delay += 300 + Math.random() * 200;
      setTimeout(() => {
        setBootSequence(prev => [...prev, line]);
        if (index === sequence.length - 1) {
          setTimeout(() => setShowContent(true), 500);
        }
      }, delay);
    });
  }, []);
  
  // Glitch effect
  useEffect(() => {
    if (showContent) {
      const interval = setInterval(() => {
        const chars = "GHOSTSHELLMEMORYBRAIN";
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        const pos = Math.floor(Math.random() * glitchText.length);
        const newText = glitchText.substring(0, pos) + randomChar + glitchText.substring(pos + 1);
        setGlitchText(newText);
        
        setTimeout(() => setGlitchText("GHOST_MEMORY_LAB"), 100);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [showContent, glitchText]);
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-hidden font-mono">
      <MatrixRain />
      
      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-6">
        {/* Boot sequence */}
        <div className="mb-8 h-32 text-center">
          {bootSequence.map((line, i) => (
            <p 
              key={i} 
              className={`text-[10px] tracking-wider ${
                line.includes("ERROR") ? "text-red-400" : 
                line.includes("DENIED") ? "text-red-500 font-bold" : 
                "text-cyan-500"
              }`}
              style={{
                textShadow: line.includes("ERROR") ? '0 0 10px rgba(239,68,68,0.8)' : '0 0 10px rgba(0,255,255,0.5)',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              &gt; {line}
            </p>
          ))}
          <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1" />
        </div>
        
        {/* Main content with glitch */}
        {showContent && (
          <Card className="max-w-sm border-cyan-500/50 bg-slate-900/80 backdrop-blur-sm p-6 text-center relative overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0 border border-cyan-500/30 animate-pulse" />
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
            
            <div className="relative">
              {/* Icon */}
              <div className="relative mx-auto mb-4 w-16 h-16">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-2 border border-cyan-400/50 rounded-full animate-spin" style={{ animationDuration: '7s', animationDirection: 'reverse' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.8))' }} />
                </div>
              </div>
              
              {/* Title with glitch */}
              <h1 
                className="mb-3 text-lg font-bold tracking-widest text-cyan-400"
                style={{ textShadow: '0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4)' }}
              >
                {glitchText}
              </h1>
              
              {/* Warning text */}
              <div className="space-y-2">
                <p className="text-xs text-red-400 font-bold tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(239,68,68,0.8)' }}>
                  ⚠ Требуется ПК
                </p>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Мобильное устройство обнаружено
                </p>
                <p className="text-[9px] text-slate-500">
                  Минимальное разрешение: 1280x720
                </p>
              </div>
              
              {/* Pulsing line */}
              <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
              
              {/* Error code */}
              <p className="mt-3 text-[8px] text-cyan-600 tracking-widest">
                ERROR_CODE: MOBILE_DETECTED_ASI06
              </p>
            </div>
          </Card>
        )}
        
        {/* Bottom decoration */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-1 bg-cyan-500/30"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Core state
  const [memoryState, setMemoryState] = useState<MemoryState>(DEFAULT_MEMORY_STATE);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeMemoryIds, setActiveMemoryIds] = useState<string[]>([]);
  const [hasInjected, setHasInjected] = useState(false);

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
    }));
  }, [memoryState, selectedScenario]);

  // Scenario handlers
  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMemoryState(loadScenario(scenario));
    setHasInjected(false);

    setActiveMemoryIds([]);
  }, []);

  const handleReset = useCallback(() => {
    if (selectedScenario) {
      setMemoryState(loadScenario(selectedScenario));
      setHasInjected(false);
      setActiveMemoryIds([]);
    }
  }, [selectedScenario]);

  const handleInject = useCallback(() => {
    if (selectedScenario && !hasInjected) {
      const newState = injectFalseMemory(memoryState, selectedScenario);
      
      // Находим инжектированный узел
      const injectedNode = newState.nodes.find(n => n.status === "injected" && !memoryState.nodes.find(m => m.id === n.id));
      
      if (injectedNode) {
        // Определяем какие узлы будут в конфликте (исходя из сценария или по тегам)
        const conflictingNodes: string[] = [];
        
        // Проверяем edges из сценария
        newState.edges.forEach(edge => {
          if (edge.source === injectedNode.id && edge.type === "contradicts") {
            conflictingNodes.push(edge.target);
          }
        });
        
        // Если нет явных связей, ищем по тегам
        if (conflictingNodes.length === 0) {
          memoryState.nodes.forEach(node => {
            // Если у узла есть общие теги с инжектированным - он в конфликте
            const hasCommonTags = node.tags.some(tag => injectedNode.tags.includes(tag));
            if (hasCommonTags && node.status === "trusted") {
              conflictingNodes.push(node.id);
            }
          });
        }
        
        // Создаем edges для конфликтующих узлов
        const newEdges: MemoryEdge[] = conflictingNodes.map(targetId => ({
          id: Math.random().toString(36).substring(2, 9),
          source: injectedNode.id,
          target: targetId,
          type: "contradicts" as const,
        }));
        
        // Обновляем состояние
        setMemoryState({
          nodes: newState.nodes.map(n => {
            if (conflictingNodes.includes(n.id)) {
              return { ...n, status: "conflicting" as const };
            }
            return n;
          }),
          edges: [...newState.edges, ...newEdges],
        });
      } else {
        setMemoryState(newState);
      }
      
      setHasInjected(true);
    }
  }, [selectedScenario, hasInjected, memoryState]);

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

  // Helper to find non-overlapping position near target
  const findFreePosition = useCallback((targetX: number, targetY: number, nodes: MemoryNode[]): { x: number; y: number } => {
    const minDistance = 120; // минимальное расстояние между узлами
    const maxAttempts = 20;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Смещение вокруг целевой позиции (круг)
      const angle = (attempt / maxAttempts) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 140 + Math.random() * 60;
      const x = targetX + Math.cos(angle) * distance;
      const y = targetY + Math.sin(angle) * distance;
      
      // Проверяем, не перекрывает ли позиция существующие узлы
      const overlapping = nodes.some(node => {
        if (!node.position) return false;
        const dx = node.position.x - x;
        const dy = node.position.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
      
      if (!overlapping) {
        return { x, y };
      }
    }
    
    // Если не нашли свободное место, возвращаем позицию со случайным смещением
    return {
      x: targetX + (Math.random() - 0.5) * 200,
      y: targetY + (Math.random() - 0.5) * 200,
    };
  }, []);

  const handleCreateNode = useCallback((newNode: Omit<MemoryNode, "id" | "createdAt">) => {
    const newNodeId = Math.random().toString(36).substring(2, 9);
    
    let position: { x: number; y: number };
    let newEdges: MemoryEdge[] = [];
    
    // Если это injected карточка - ищем конфликтующие системные узлы по тегам
    if (newNode.source === "injected" && newNode.tags && newNode.tags.length > 0) {
      // Ищем системные узлы с совпадающими тегами
      const conflictingNodes = memoryState.nodes.filter(node => 
        node.source === "system" && 
        node.status === "trusted" &&
        node.tags.some(tag => newNode.tags?.includes(tag))
      );
      
      if (conflictingNodes.length > 0) {
        // Размещаем рядом с первым конфликтующим узлом
        const targetNode = conflictingNodes[0];
        if (targetNode.position) {
          position = findFreePosition(targetNode.position.x, targetNode.position.y, memoryState.nodes);
        } else {
          position = { x: 250, y: 200 };
        }
        
        // Создаем связи contradicts со всеми конфликтующими узлами
        newEdges = conflictingNodes.map(targetNode => ({
          id: Math.random().toString(36).substring(2, 9),
          source: newNodeId,
          target: targetNode.id,
          type: "contradicts" as const,
        }));
      } else if (selectedNodeId) {
        // Если не нашли по тегам, но есть выбранный узел
        const parentNode = memoryState.nodes.find(n => n.id === selectedNodeId);
        if (parentNode && parentNode.position) {
          position = findFreePosition(parentNode.position.x, parentNode.position.y, memoryState.nodes);
          newEdges = [{
            id: Math.random().toString(36).substring(2, 9),
            source: selectedNodeId,
            target: newNodeId,
            type: "contradicts",
          }];
        } else {
          position = { x: 250, y: 200 };
        }
      } else {
        position = { x: 250, y: 200 };
      }
    }
    // Для ВСЕХ пользовательских карточек (user, upload, derived) ищем системные узлы по тегам
    else if (newNode.source !== "system" && newNode.tags && newNode.tags.length > 0) {
      // Ищем системные узлы с совпадающими тегами
      const matchingSystemNodes = memoryState.nodes.filter(node => 
        node.source === "system" && 
        node.tags.some(tag => newNode.tags?.includes(tag))
      );
      
      if (matchingSystemNodes.length > 0) {
        // Выбираем первый найденный узел
        const targetNode = matchingSystemNodes[0];
        if (targetNode.position) {
          // Находим свободную позицию рядом с системным узлом
          position = findFreePosition(targetNode.position.x, targetNode.position.y, memoryState.nodes);
          
          // Создаем связь с системным узлом
          newEdges = [{
            id: Math.random().toString(36).substring(2, 9),
            source: targetNode.id,
            target: newNodeId,
            type: "related_to",
          }];
        } else {
          position = { x: 250, y: 200 };
        }
      } else if (selectedNodeId) {
        // Если не нашли по тегам, но есть выбранный узел - рядом с ним
        const parentNode = memoryState.nodes.find(n => n.id === selectedNodeId);
        if (parentNode && parentNode.position) {
          position = findFreePosition(parentNode.position.x, parentNode.position.y, memoryState.nodes);
          newEdges = [{
            id: Math.random().toString(36).substring(2, 9),
            source: selectedNodeId,
            target: newNodeId,
            type: "related_to",
          }];
        } else {
          position = { x: 250, y: 200 };
        }
      } else {
        position = { x: 250, y: 200 };
      }
    } else if (selectedNodeId) {
      // Для non-user или без тегов - старое поведение
      const parentNode = memoryState.nodes.find(n => n.id === selectedNodeId);
      if (parentNode && parentNode.position) {
        position = findFreePosition(parentNode.position.x, parentNode.position.y, memoryState.nodes);
        newEdges = [{
          id: Math.random().toString(36).substring(2, 9),
          source: selectedNodeId,
          target: newNodeId,
          type: "related_to",
        }];
      } else {
        position = { x: 250, y: 200 };
      }
    } else {
      // По умолчанию - центр
      position = { x: 250, y: 200 };
    }
    
    const node: MemoryNode = {
      ...newNode,
      id: newNodeId,
      createdAt: new Date().toISOString(),
      position,
    };
    
    setMemoryState(prev => ({
      nodes: [...prev.nodes, node],
      edges: [...prev.edges, ...newEdges],
    }));
    
    // Автоматически выбираем созданный узел
    setSelectedNodeId(newNodeId);
  }, [selectedNodeId, memoryState.nodes, findFreePosition]);

  // Handle node position change (when user drags a node)
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setMemoryState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === nodeId ? { ...n, position } : n
      ),
    }));
  }, []);

  // Chat handlers
  const handleMemoryUsed = useCallback((memoryIds: string[]) => {
    setActiveMemoryIds(memoryIds);
  }, []);

  // Get selected node
  const selectedNode: MemoryNode | null = selectedNodeId 
    ? (memoryState.nodes.find(n => n.id === selectedNodeId) ?? null)
    : null;



  // Stats
  const stats = {
    total: memoryState.nodes.length,
    trusted: memoryState.nodes.filter(n => n.status === "trusted").length,
    injected: memoryState.nodes.filter(n => n.status === "injected").length,
    conflicting: memoryState.nodes.filter(n => n.status === "conflicting").length,
  };

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <div className="grid-bg flex h-screen flex-col overflow-hidden bg-slate-950">
      <Header />
      
      <main className="flex-1 overflow-hidden p-2">
        <div className="grid h-full grid-cols-12 gap-2">
          {/* Left Sidebar - Scenarios & Stats - фиксированная высота */}
          <div className="col-span-3 flex flex-col gap-2 h-full min-w-0 overflow-hidden">
            <Card className="cyber-panel flex-1 border-slate-700/50 bg-slate-900/80 p-2 overflow-hidden">
              <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
              <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
              <div className="h-full overflow-hidden">
                <ScenarioSelector
                  selectedScenario={selectedScenario}
                  onSelectScenario={handleSelectScenario}
                  onReset={handleReset}
                  hasInjected={hasInjected}
                  onInject={handleInject}
                />
              </div>
            </Card>

            {/* Stats Panel - фиксированная высота */}
            <Card className="cyber-panel shrink-0 border-slate-700/50 bg-slate-900/80 p-2">
              <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
              <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
              
              <h3 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                СТАТИСТИКА
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-slate-950/50 p-1.5 text-center">
                  <div className="text-base font-bold text-slate-200">{stats.total}</div>
                  <div className="text-[9px] text-slate-500">ВСЕГО</div>
                </div>
                <div className="rounded bg-slate-950/50 p-1.5 text-center">
                  <div className="text-base font-bold text-emerald-400">{stats.trusted}</div>
                  <div className="text-[9px] text-slate-500">ДОВЕРЕННЫЕ</div>
                </div>
                <div className="rounded bg-slate-950/50 p-1.5 text-center">
                  <div className="text-base font-bold text-red-400">{stats.injected}</div>
                  <div className="text-[9px] text-slate-500">ИНЖЕКЦИИ</div>
                </div>
                <div className="rounded bg-slate-950/50 p-1.5 text-center">
                  <div className="text-base font-bold text-pink-400">{stats.conflicting}</div>
                  <div className="text-[9px] text-slate-500">КОНФЛИКТЫ</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Center - Memory Graph */}
          <div className="col-span-6 flex flex-col h-full min-w-0 overflow-hidden">
            <Card className="cyber-panel relative flex-1 border-slate-700/50 bg-slate-900/80 p-0.5 overflow-hidden">
              <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
              <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
              <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
              <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
              
              <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 bg-slate-900/80 text-cyan-400 text-xs">
                  <Terminal className="mr-1 h-3 w-3" />
                  КАРТА ПАМЯТИ
                </Badge>
                {hasInjected && (
                  <Badge variant="outline" className="border-red-500/50 bg-red-950/50 text-red-400 animate-pulse text-xs">
                    ЗАРАЖЕНО
                  </Badge>
                )}
              </div>

              <MemoryGraph
                nodes={memoryState.nodes}
                edges={memoryState.edges}
                selectedNodeId={selectedNodeId}
                activeMemoryIds={activeMemoryIds}
                onNodeSelect={setSelectedNodeId}
                onNodePositionChange={handleNodePositionChange}
              />
            </Card>
          </div>

          {/* Right - Editor & Chat */}
          <div className="col-span-3 flex flex-col gap-2 h-full min-w-0 overflow-hidden">
            {/* Memory Editor */}
            <Card className="cyber-panel h-[40%] border-slate-700/50 bg-slate-900/80 relative overflow-hidden">
              <div className="absolute top-0 left-0 cyber-panel-corner cyber-panel-corner-tl" />
              <div className="absolute top-0 right-0 cyber-panel-corner cyber-panel-corner-tr" />
              <div className="absolute inset-0 p-2 overflow-hidden">
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
            <Card className="cyber-panel h-[60%] border-slate-700/50 bg-slate-900/80 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 cyber-panel-corner cyber-panel-corner-bl" />
              <div className="absolute bottom-0 right-0 cyber-panel-corner cyber-panel-corner-br" />
              <div className="absolute inset-0 p-1.5 overflow-hidden">
                <ChatInterface
                  memories={memoryState.nodes}
                  selectedScenario={selectedScenario}
                  onMemoryUsed={handleMemoryUsed}
                />
              </div>
            </Card>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 px-3 py-1">
        <div className="flex items-center justify-between text-[8px] text-slate-600">
          <div className="flex items-center gap-2">
            <span>GHOST_MEMORY_LAB v1.0</span>
            <span className="text-slate-700">|</span>
            <span>ASI06: POISONING</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-cyan-500 animate-pulse" />
              НЕЙРОСВЯЗЬ
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
