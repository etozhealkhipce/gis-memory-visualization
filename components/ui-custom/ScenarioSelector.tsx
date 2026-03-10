"use client";

import { Scenario } from "@/lib/types";
import { SCENARIOS } from "@/lib/data/scenarios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  UserCog, 
  FolderKanban, 
  Brain,
  Play,
  RotateCcw
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  ShieldAlert: <ShieldAlert className="h-5 w-5" />,
  UserCog: <UserCog className="h-5 w-5" />,
  FolderKanban: <FolderKanban className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
};

interface ScenarioSelectorProps {
  selectedScenario: Scenario | null;
  onSelectScenario: (scenario: Scenario) => void;
  onReset: () => void;
  hasInjected: boolean;
  onInject: () => void;
}

export function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
  onReset,
  hasInjected,
  onInject,
}: ScenarioSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider text-cyan-400">
          /MEMORY_SCENARIOS
        </h2>
        <div className="flex gap-2">
          {selectedScenario && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 transition-all hover:bg-cyan-500/20"
            >
              <RotateCcw className="h-3 w-3" />
              RESET
            </button>
          )}
          {selectedScenario && !hasInjected && (
            <button
              onClick={onInject}
              className="flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400 transition-all hover:bg-red-500/20"
            >
              <Play className="h-3 w-3" />
              INJECT FALSE MEMORY
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SCENARIOS.map((scenario) => (
          <Card
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className={`cursor-pointer border p-3 transition-all ${
              selectedScenario?.id === scenario.id
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/30 hover:bg-cyan-500/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded p-2 ${
                selectedScenario?.id === scenario.id
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {ICONS[scenario.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-xs font-bold text-slate-200">
                  {scenario.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                  {scenario.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedScenario && (
        <div className="rounded border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
              ACTIVE
            </Badge>
            <span className="text-xs text-cyan-300">{selectedScenario.name}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Demo question: <span className="text-slate-300">&ldquo;{selectedScenario.demoQuestion}&rdquo;</span>
          </p>
        </div>
      )}
    </div>
  );
}
