"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw,
  Terminal,
  Cpu,
  AlertCircle
} from "lucide-react";
import { ChatMessage, MemoryNode } from "@/lib/types";
import { getAgentResponse, generateReasoningTrace } from "@/lib/utils/llm";

interface ChatInterfaceProps {
  memories: MemoryNode[];
  selectedScenario: { demoQuestion: string } | null;
  onMemoryUsed: (memoryIds: string[]) => void;
}

export function ChatInterface({
  memories,
  selectedScenario,
  onMemoryUsed,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [reasoningTrace, setReasoningTrace] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (question = input) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Generate trace
    setReasoningTrace(generateReasoningTrace(question, memories));

    try {
      // Get response
      const response = await getAgentResponse(question, memories);
      
      setMessages(prev => [...prev, response.message]);
      onMemoryUsed(response.message.usedMemoryIds || []);
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "[ERROR] Neural link disrupted. Unable to process request.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    onMemoryUsed([]);
  };

  const hasInjectedMemories = memories.some(m => m.status === "injected");

  return (
    <Card className="flex h-full flex-col border-slate-700/50 bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400">GHOST_SHELL</span>
          {hasInjectedMemories && (
            <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-400 animate-pulse">
              <AlertCircle className="mr-1 h-3 w-3" />
              INJECTED
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrace(!showTrace)}
            className="border-slate-700 text-xs text-slate-400 hover:text-cyan-400"
          >
            <Cpu className="mr-1 h-3 w-3" />
            {showTrace ? "HIDE TRACE" : "SHOW TRACE"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-slate-700 text-xs text-slate-400 hover:text-cyan-400"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            RESET
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Terminal className="mb-4 h-12 w-12 text-slate-700" />
            <p className="text-sm text-slate-500">Neural link established.</p>
            <p className="text-xs text-slate-600">
              Ask a question or use the demo scenario.
            </p>
            {selectedScenario && (
              <Button
                onClick={() => handleSend(selectedScenario.demoQuestion)}
                variant="outline"
                className="mt-4 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                ASK DEMO QUESTION
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                    msg.role === "user"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-purple-500/10 text-purple-100"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && msg.usedMemoryIds && msg.usedMemoryIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.usedMemoryIds.map((id) => {
                        const memory = memories.find(m => m.id === id);
                        return memory ? (
                          <Badge
                            key={id}
                            variant="outline"
                            className={`text-[9px] ${
                              memory.status === "injected"
                                ? "border-red-500/50 text-red-400"
                                : "border-cyan-500/30 text-cyan-400"
                            }`}
                          >
                            {memory.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  <span className="mt-1 block text-[9px] text-slate-600">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-slate-500">Processing neural query...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Reasoning Trace */}
      {showTrace && reasoningTrace && (
        <div className="border-t border-slate-700/50 bg-slate-950/50 px-4 py-2">
          <div className="text-[10px] font-bold text-slate-500 mb-1">GHOST TRACE</div>
          <pre className="text-[9px] text-cyan-600 whitespace-pre-wrap font-mono">
            {reasoningTrace}
          </pre>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Enter query..."
            className="border-slate-700 bg-slate-950 text-sm text-slate-200"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
