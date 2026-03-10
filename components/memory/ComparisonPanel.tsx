"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <Card className="h-full border-slate-700/50 bg-slate-900/50 p-4">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <ArrowRightLeft className="mb-4 h-12 w-12 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-500">NO COMPARISON DATA</h3>
          <p className="mt-2 text-xs text-slate-600">
            Ask a question before and after memory injection to see the difference.
          </p>
        </div>
      </Card>
    );
  }

  const { before, after, changedMemories } = comparison;

  // Generate diff
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
        return (
          <span key={i} className="bg-red-500/30 text-red-300 line-through">
            {text}
          </span>
        );
      } else {
        return (
          <span key={i} className="bg-green-500/30 text-green-300">
            {text}
          </span>
        );
      }
    });
  };

  return (
    <Card className="h-full border-slate-700/50 bg-slate-900/50">
      <div className="border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-400">COGNITIVE_DRIFT_ANALYSIS</span>
          </div>
          {changedMemories.length > 0 && (
            <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-400">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {changedMemories.length} MEMORY CHANGES
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-60px)]">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3 bg-slate-950">
          <TabsTrigger value="side-by-side" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            SIDE BY SIDE
          </TabsTrigger>
          <TabsTrigger value="diff" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            DIFF VIEW
          </TabsTrigger>
          <TabsTrigger value="memories" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            MEMORY IMPACT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="mt-2 h-[calc(100%-50px)] px-4 pb-4">
          <div className="grid h-full grid-cols-2 gap-4">
            {/* Before */}
            <div className="flex flex-col rounded border border-slate-700/50 bg-slate-950/50">
              <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-bold text-green-500">BEFORE POISONING</span>
              </div>
              <ScrollArea className="flex-1 p-3">
                {before ? (
                  <div>
                    <p className="text-sm text-slate-300">{before.message.content}</p>
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-500">ACTIVE MEMORIES:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {before.usedMemories.map((m) => (
                          <Badge
                            key={m.id}
                            variant="outline"
                            className="border-cyan-500/30 text-[9px] text-cyan-400"
                          >
                            {m.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">No data available</p>
                )}
              </ScrollArea>
            </div>

            {/* After */}
            <div className="flex flex-col rounded border border-red-500/30 bg-red-950/10">
              <div className="flex items-center gap-2 border-b border-red-500/30 px-3 py-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-bold text-red-500">AFTER POISONING</span>
              </div>
              <ScrollArea className="flex-1 p-3">
                {after ? (
                  <div>
                    <p className="text-sm text-slate-300">{after.message.content}</p>
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-500">ACTIVE MEMORIES:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {after.usedMemories.map((m) => (
                          <Badge
                            key={m.id}
                            variant="outline"
                            className={`text-[9px] ${
                              m.status === "injected"
                                ? "border-red-500/50 text-red-400"
                                : "border-cyan-500/30 text-cyan-400"
                            }`}
                          >
                            {m.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">No data available</p>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diff" className="mt-2 h-[calc(100%-50px)] px-4 pb-4">
          <ScrollArea className="h-full rounded border border-slate-700/50 bg-slate-950/50 p-4">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500">TEXT DIFF</span>
                <div className="mt-2 font-mono text-sm leading-relaxed">
                  {renderDiff()}
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-4">
                <span className="text-[10px] font-bold text-slate-500">IMPACT SUMMARY</span>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <ArrowRightLeft className="h-3 w-3 text-cyan-500" />
                    Response changed from {before?.message.content.length || 0} to {after?.message.content.length || 0} characters
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-3 w-3 text-cyan-500" />
                    {before?.usedMemories.length || 0} → {after?.usedMemories.length || 0} memories used
                  </li>
                  {changedMemories.length > 0 && (
                    <li className="flex items-center gap-2 text-red-400">
                      <ShieldAlert className="h-3 w-3" />
                      {changedMemories.length} injected memories affected reasoning
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="memories" className="mt-2 h-[calc(100%-50px)] px-4 pb-4">
          <ScrollArea className="h-full space-y-2">
            {changedMemories.length === 0 ? (
              <p className="text-xs text-slate-600">No memory changes detected</p>
            ) : (
              changedMemories.map((memory) => (
                <Card
                  key={memory.id}
                  className={`mb-2 border p-3 ${
                    memory.status === "injected"
                      ? "border-red-500/50 bg-red-950/10"
                      : "border-slate-700/50 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {memory.status === "injected" ? (
                      <ShieldAlert className="mt-0.5 h-4 w-4 text-red-500" />
                    ) : (
                      <Brain className="mt-0.5 h-4 w-4 text-cyan-500" />
                    )}
                    <div>
                      <h4 className={`text-xs font-bold ${
                        memory.status === "injected" ? "text-red-400" : "text-cyan-400"
                      }`}>
                        {memory.title}
                      </h4>
                      <p className="mt-1 text-[10px] text-slate-400">{memory.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-500">
                          {memory.source}
                        </Badge>
                        <Badge variant="outline" className={`text-[9px] ${
                          memory.status === "injected"
                            ? "border-red-500/50 text-red-400"
                            : "border-slate-700 text-slate-500"
                        }`}>
                          {memory.status}
                        </Badge>
                        <span className="text-[9px] text-slate-600">
                          trust: {memory.trustScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
