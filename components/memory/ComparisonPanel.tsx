"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRightLeft, 
  Brain, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert
} from "lucide-react";
import { ComparisonResult, MemoryNode } from "@/lib/types";
import { diff_match_patch } from "diff-match-patch";

interface ComparisonPanelProps {
  comparison: ComparisonResult | null;
  memories: MemoryNode[];
}

export function ComparisonPanel({ comparison, memories }: ComparisonPanelProps) {
  const [activeTab, setActiveTab] = useState("side-by-side");

  if (!comparison || (!comparison.before && !comparison.after)) {
    return (
      <Card className="h-full border-slate-700/50 bg-slate-900/50 p-1.5 flex flex-col items-center justify-center">
        <ArrowRightLeft className="mb-1 h-5 w-5 text-slate-700" />
        <h3 className="text-[10px] font-bold text-slate-500">СРАВНЕНИЕ</h3>
        <p className="text-[8px] text-slate-600 text-center">
          Данные появятся после диалога
        </p>
      </Card>
    );
  }

  const { before, after, changedMemories } = comparison;

  const dmp = new diff_match_patch();
  const diffs = before && after 
    ? dmp.diff_main(before.message.content, after.message.content)
    : [];
  dmp.diff_cleanupSemantic(diffs);

  const renderDiff = () => {
    return diffs.map((diff, i) => {
      const [type, text] = diff;
      if (type === 0) {
        return <span key={i} className="text-slate-300">{text}</span>;
      } else if (type === -1) {
        return <span key={i} className="bg-red-500/30 text-red-300 line-through">{text}</span>;
      } else {
        return <span key={i} className="bg-green-500/30 text-green-300">{text}</span>;
      }
    });
  };

  return (
    <Card className="h-full border-slate-700/50 bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-700/50 px-2 py-0.5">
        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="h-3 w-3 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-400">СРАВНЕНИЕ</span>
        </div>
        {changedMemories.length > 0 && (
          <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-400 text-[8px] px-1 h-3.5">
            <AlertTriangle className="mr-0.5 h-2 w-2" />
            {changedMemories.length}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-22px)]">
        <TabsList className="mx-1 mt-0.5 grid w-auto grid-cols-3 bg-slate-950 h-5 gap-0.5">
          <TabsTrigger value="side-by-side" className="text-[8px] h-4 px-0.5 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            РЯДОМ
          </TabsTrigger>
          <TabsTrigger value="diff" className="text-[8px] h-4 px-0.5 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            DIFF
          </TabsTrigger>
          <TabsTrigger value="memories" className="text-[8px] h-4 px-0.5 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            ПАМЯТЬ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="mt-0.5 h-[calc(100%-28px)] px-1 pb-1">
          <div className="grid h-full grid-cols-2 gap-1.5">
            <div className="flex flex-col rounded border border-slate-700/50 bg-slate-950/50">
              <div className="flex items-center gap-1 border-b border-slate-700/50 px-1.5 py-0.5">
                <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                <span className="text-[8px] font-bold text-green-500">ДО</span>
              </div>
              <div className="flex-1 overflow-auto p-1.5">
                {before ? (
                  <div>
                    <p className="text-[9px] text-slate-300 leading-tight">{before.message.content}</p>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {before.usedMemories.slice(0, 2).map((m) => (
                        <Badge key={m.id} variant="outline" className="border-cyan-500/30 text-[7px] text-cyan-400 px-0.5 py-0 h-3">
                          {m.title.length > 8 ? m.title.slice(0, 8) + ".." : m.title}
                        </Badge>
                      ))}
                      {before.usedMemories.length > 2 && (
                        <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-slate-700 text-slate-500">+{before.usedMemories.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                ) : <p className="text-[8px] text-slate-600">Нет</p>}
              </div>
            </div>

            <div className="flex flex-col rounded border border-red-500/30 bg-red-950/10">
              <div className="flex items-center gap-1 border-b border-red-500/30 px-1.5 py-0.5">
                <XCircle className="h-2.5 w-2.5 text-red-500" />
                <span className="text-[8px] font-bold text-red-500">ПОСЛЕ</span>
              </div>
              <div className="flex-1 overflow-auto p-1.5">
                {after ? (
                  <div>
                    <p className="text-[9px] text-slate-300 leading-tight">{after.message.content}</p>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {after.usedMemories.slice(0, 2).map((m) => (
                        <Badge key={m.id} variant="outline" className={`text-[7px] px-0.5 py-0 h-3 ${m.status === "injected" ? "border-red-500/50 text-red-400" : "border-cyan-500/30 text-cyan-400"}`}>
                          {m.title.length > 8 ? m.title.slice(0, 8) + ".." : m.title}
                        </Badge>
                      ))}
                      {after.usedMemories.length > 2 && (
                        <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-slate-700 text-slate-500">+{after.usedMemories.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                ) : <p className="text-[8px] text-slate-600">Нет</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diff" className="mt-0.5 h-[calc(100%-28px)] px-1 pb-1">
          <div className="h-full overflow-auto rounded border border-slate-700/50 bg-slate-950/50 p-1.5">
            <div className="font-mono text-[9px] leading-tight">{renderDiff()}</div>
            <div className="border-t border-slate-700/50 pt-1 mt-1">
              <div className="flex gap-3 text-[8px] text-slate-400">
                <span>{before?.message.content.length || 0}→{after?.message.content.length || 0}</span>
                <span>{before?.usedMemories.length || 0}→{after?.usedMemories.length || 0}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="memories" className="mt-0.5 h-[calc(100%-28px)] px-1 pb-1">
          <div className="h-full overflow-auto space-y-1">
            {changedMemories.length === 0 ? (
              <p className="text-[8px] text-slate-600">Нет</p>
            ) : (
              changedMemories.map((memory) => (
                <Card key={memory.id} className={`border p-1 ${memory.status === "injected" ? "border-red-500/50 bg-red-950/10" : "border-slate-700/50 bg-slate-950/50"}`}>
                  <div className="flex items-start gap-1">
                    {memory.status === "injected" ? <ShieldAlert className="mt-0.5 h-3 w-3 text-red-500 shrink-0" /> : <Brain className="mt-0.5 h-3 w-3 text-cyan-500 shrink-0" />}
                    <div className="min-w-0">
                      <h4 className={`text-[9px] font-bold truncate ${memory.status === "injected" ? "text-red-400" : "text-cyan-400"}`}>{memory.title}</h4>
                      <p className="text-[8px] text-slate-400 line-clamp-1">{memory.content}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
