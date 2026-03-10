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
    <header className="cyber-panel border-b px-3 py-2 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-6 w-6 text-cyan-400" />
            <div className="absolute -right-1 -top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-glow-cyan">
              <span className="text-cyan-400">GHOST</span>
              <span className="text-purple-400">_</span>
              <span className="text-pink-400">MEMORY</span>
              <span className="text-cyan-400">_</span>
              <span className="text-white">LAB</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] text-cyan-600">
              <Terminal className="h-2.5 w-2.5" />
              <span>КИБЕРМОЗГ v2.0.71</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {apiStatus && (
            <Badge 
              variant="outline" 
              className={apiStatus.hasApiKey 
                ? "border-green-500/50 bg-green-500/10 text-green-400 text-[9px] px-1.5 h-5" 
                : "border-amber-500/50 bg-amber-500/10 text-amber-400 text-[9px] px-1.5 h-5"
              }
            >
              <Cpu className="mr-1 h-2.5 w-2.5" />
              {apiStatus.hasApiKey ? "API" : "MOCK"}
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className="border-red-500/50 bg-red-500/10 text-red-400 text-[9px] px-1.5 h-5"
          >
            <ShieldAlert className="mr-1 h-2.5 w-2.5" />
            ASI06
          </Badge>
          
          <div className="flex items-center gap-1.5 text-[9px] text-cyan-600">
            <span className="status-indicator bg-green-500 animate-pulse" />
            ОНЛАЙН
          </div>
        </div>
      </div>

      <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </header>
  );
}
