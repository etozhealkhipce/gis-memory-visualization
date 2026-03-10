"use client";

import { useEffect, useState } from "react";
import { Brain, ShieldAlert, Terminal, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [apiStatus, setApiStatus] = useState<{ hasApiKey: boolean; mode: string } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then(res => res.json())
      .then(setApiStatus)
      .catch(console.error);
  }, []);

  return (
    <header className="cyber-panel border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Brain className="h-8 w-8 text-cyan-400" />
            <div className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-glow-cyan">
              <span className="text-cyan-400">GHOST</span>
              <span className="text-purple-400">_</span>
              <span className="text-pink-400">MEMORY</span>
              <span className="text-cyan-400">_</span>
              <span className="text-white">LAB</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-cyan-600">
              <Terminal className="h-3 w-3" />
              <span>CYBERBRAIN INTERFACE v2.0.71</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* API Status */}
          {apiStatus && (
            <Badge 
              variant="outline" 
              className={apiStatus.hasApiKey 
                ? "border-green-500/50 bg-green-500/10 text-green-400" 
                : "border-amber-500/50 bg-amber-500/10 text-amber-400"
              }
            >
              <Cpu className="mr-1 h-3 w-3" />
              {apiStatus.hasApiKey ? "OPENAI API" : "MOCK MODE"}
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className="border-red-500/50 bg-red-500/10 text-red-400"
          >
            <ShieldAlert className="mr-1 h-3 w-3" />
            ASI06: MEMORY POISONING
          </Badge>
          
          <div className="flex items-center gap-2 text-xs text-cyan-600">
            <span className="status-indicator bg-green-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </header>
  );
}
