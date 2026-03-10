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
  ShieldAlert: <ShieldAlert className="h-4 w-4" />,
  UserCog: <UserCog className="h-4 w-4" />,
  FolderKanban: <FolderKanban className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wider text-cyan-400">
          /СЦЕНАРИИ
        </h2>
        <div className="flex gap-1">
          {selectedScenario && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-400 transition-all hover:bg-cyan-500/20"
            >
              <RotateCcw className="h-3 w-3" />
              СБРОС
            </button>
          )}
          {selectedScenario && !hasInjected && (
            <button
              onClick={onInject}
              className="flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-400 transition-all hover:bg-red-500/20"
            >
              <Play className="h-3 w-3" />
              ИНЖ
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {SCENARIOS.map((scenario) => (
          <Card
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className={`cursor-pointer border p-1.5 transition-all ${
              selectedScenario?.id === scenario.id
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/30 hover:bg-cyan-500/5"
            }`}
          >
            <div className="flex items-start gap-1.5">
              <div className={`rounded p-1 ${
                selectedScenario?.id === scenario.id
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {ICONS[scenario.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-[10px] font-bold text-slate-200">
                  {scenario.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[8px] text-slate-500 leading-tight">
                  {scenario.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedScenario && (
        <div className="rounded border border-cyan-500/20 bg-cyan-500/5 p-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[9px] px-1 h-4">
              АКТИВЕН
            </Badge>
            <span className="text-[10px] text-cyan-300 truncate">{selectedScenario.name}</span>
          </div>
          <p className="mt-1 text-[9px] text-slate-400 leading-tight">
            {selectedScenario.demoQuestion}
          </p>
        </div>
      )}
    </div>
  );
}
