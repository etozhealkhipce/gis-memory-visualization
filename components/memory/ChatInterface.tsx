"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (question = input) => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setReasoningTrace(generateReasoningTrace(question, memories));

    try {
      const response = await getAgentResponse(question, memories);
      setMessages(prev => [...prev, response.message]);
      onMemoryUsed(response.message.usedMemoryIds || []);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "[ОШИБКА] Нейросвязь нарушена.",
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
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-2 py-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-400">GHOST</span>
          {hasInjectedMemories && (
            <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-400 animate-pulse text-[8px] px-1 h-4 ml-1">
              <AlertCircle className="mr-0.5 h-2.5 w-2.5" />
              ИНЖ
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrace(!showTrace)}
            className="border-slate-700 text-[9px] text-slate-400 hover:text-cyan-400 h-6 px-1.5"
          >
            <Cpu className="mr-0.5 h-2.5 w-2.5" />
            {showTrace ? "СКРЫТЬ" : "TRACE"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-slate-700 text-[9px] text-slate-400 hover:text-cyan-400 h-6 px-1.5"
          >
            <RotateCcw className="mr-0.5 h-2.5 w-2.5" />
            СБРОС
          </Button>
        </div>
      </div>

      {/* Messages - прокручиваемая область, скроллбар скрыт */}
      <div className="flex-1 overflow-y-auto min-h-0 p-2 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[80px]">
            <Terminal className="mb-1.5 h-6 w-6 text-slate-700" />
            <p className="text-[10px] text-slate-500">Нейросвязь установлена.</p>
            <p className="text-[9px] text-slate-600">Задайте вопрос</p>
            {selectedScenario && (
              <Button
                onClick={() => handleSend(selectedScenario.demoQuestion)}
                variant="outline"
                className="mt-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 h-6 text-[9px] px-2"
              >
                ДЕМО
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                    msg.role === "user" ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >
                  {msg.role === "user" ? <User className="h-2.5 w-2.5" /> : <Bot className="h-2.5 w-2.5" />}
                </div>
                <div
                  className={`max-w-[85%] rounded px-2 py-1 ${
                    msg.role === "user" ? "bg-purple-500/10 text-purple-100" : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="text-[10px] whitespace-pre-wrap leading-tight">{msg.content}</p>
                  {msg.role === "assistant" && msg.usedMemoryIds && msg.usedMemoryIds.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {msg.usedMemoryIds.slice(0, 3).map((id) => {
                        const memory = memories.find(m => m.id === id);
                        return memory ? (
                          <Badge
                            key={id}
                            variant="outline"
                            className={`text-[7px] px-0.5 py-0 h-3 ${
                              memory.status === "injected" ? "border-red-500/50 text-red-400" : "border-cyan-500/30 text-cyan-400"
                            }`}
                          >
                            {memory.title.length > 12 ? memory.title.slice(0, 12) + ".." : memory.title}
                          </Badge>
                        ) : null;
                      })}
                      {msg.usedMemoryIds.length > 3 && (
                        <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-slate-700 text-slate-500">
                          +{msg.usedMemoryIds.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-1.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400">
                  <Bot className="h-2.5 w-2.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded bg-slate-800 px-2 py-1">
                  <div className="flex gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reasoning Trace */}
      {showTrace && reasoningTrace && (
        <div className="shrink-0 border-t border-slate-700/50 bg-slate-950/50 px-2 py-1 max-h-[50px] overflow-y-auto scrollbar-hide">
          <div className="text-[8px] font-bold text-slate-500 mb-0.5">TRACE</div>
          <pre className="text-[7px] text-cyan-600 whitespace-pre-wrap font-mono leading-tight">
            {reasoningTrace}
          </pre>
        </div>
      )}

      {/* Input - всегда внизу */}
      <div className="shrink-0 border-t border-slate-700/50 p-1.5 bg-slate-900/50">
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Введите запрос..."
            className="border-slate-700 bg-slate-950 text-[10px] text-slate-200 h-7"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 h-7 w-7 p-0 shrink-0"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
