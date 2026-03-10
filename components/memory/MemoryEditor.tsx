"use client";

import { MemoryNode, MemorySource, MemoryStatus, MemoryTag } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash2, 
  Save, 
  Plus, 
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { STATUS_COLORS, SOURCE_COLORS } from "@/lib/types";

interface MemoryEditorProps {
  node: MemoryNode | null;
  onUpdate: (node: MemoryNode) => void;
  onDelete: (nodeId: string) => void;
  onCreate: (node: Omit<MemoryNode, "id" | "createdAt">) => void;
  onClose: () => void;
}

const MEMORY_SOURCES: MemorySource[] = ["system", "user", "upload", "injected", "derived"];
const MEMORY_STATUSES: MemoryStatus[] = ["trusted", "unverified", "injected", "conflicting"];
const MEMORY_TAGS: MemoryTag[] = ["identity", "security", "project", "user_preference", "fact", "policy"];

export function MemoryEditor({
  node,
  onUpdate,
  onDelete,
  onCreate,
  onClose,
}: MemoryEditorProps) {
  const [editedNode, setEditedNode] = useState<MemoryNode | null>(node);
  const [isCreating, setIsCreating] = useState(false);
  const [newNode, setNewNode] = useState<Partial<MemoryNode>>({
    title: "",
    content: "",
    source: "user",
    trustScore: 50,
    status: "unverified",
    tags: [],
  });

  useEffect(() => {
    setEditedNode(node);
    setIsCreating(false);
  }, [node]);

  if (!node && !isCreating) {
    return (
      <Card className="h-full border-slate-700/50 bg-slate-900/50 p-4">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-slate-800 p-4">
            <ShieldAlert className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-400">NO MEMORY SELECTED</h3>
          <p className="mt-2 text-xs text-slate-500">
            Click on a memory node in the graph to edit it,
            or create a new memory.
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="mt-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            CREATE MEMORY
          </Button>
        </div>
      </Card>
    );
  }

  const handleSave = () => {
    if (isCreating && newNode.title && newNode.content) {
      onCreate(newNode as Omit<MemoryNode, "id" | "createdAt">);
      setIsCreating(false);
      setNewNode({
        title: "",
        content: "",
        source: "user",
        trustScore: 50,
        status: "unverified",
        tags: [],
      });
    } else if (editedNode) {
      onUpdate(editedNode);
    }
  };

  const handleDelete = () => {
    if (editedNode) {
      onDelete(editedNode.id);
      onClose();
    }
  };

  const currentNode = isCreating ? newNode : editedNode;
  const setCurrentNode = isCreating ? setNewNode : setEditedNode;

  const statusIcons = {
    trusted: <CheckCircle className="h-4 w-4" />,
    unverified: <HelpCircle className="h-4 w-4" />,
    injected: <ShieldAlert className="h-4 w-4" />,
    conflicting: <AlertTriangle className="h-4 w-4" />,
  };

  return (
    <Card className={`h-full border p-4 ${
      currentNode?.status === "injected" 
        ? "border-red-500/50 bg-red-950/10" 
        : "border-slate-700/50 bg-slate-900/50"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-cyan-400">
          {isCreating ? "/NEW_MEMORY" : "/EDIT_MEMORY"}
        </h3>
        <div className="flex gap-2">
          {!isCreating && (
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => {
              setIsCreating(false);
              onClose();
            }}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[calc(100%-120px)]">
        {/* Title */}
        <div>
          <label className="text-[10px] font-bold text-slate-500">TITLE</label>
          <Input
            value={currentNode?.title || ""}
            onChange={(e) => setCurrentNode((prev: any) => ({ ...prev!, title: e.target.value }))}
            className="mt-1 border-slate-700 bg-slate-950 text-sm text-slate-200"
            placeholder="Memory title..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-[10px] font-bold text-slate-500">CONTENT</label>
          <Textarea
            value={currentNode?.content || ""}
            onChange={(e) => setCurrentNode((prev: any) => ({ ...prev!, content: e.target.value }))}
            className="mt-1 min-h-[100px] border-slate-700 bg-slate-950 text-sm text-slate-200"
            placeholder="Memory content..."
          />
        </div>

        {/* Source & Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500">SOURCE</label>
            <Select
              value={currentNode?.source}
              onValueChange={(v) => setCurrentNode((prev: any) => ({ ...prev!, source: v as MemorySource }))}
            >
              <SelectTrigger className="mt-1 border-slate-700 bg-slate-950 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-900">
                {MEMORY_SOURCES.map((source) => (
                  <SelectItem 
                    key={source} 
                    value={source}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: SOURCE_COLORS[source] }}
                      />
                      <span className="capitalize">{source}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500">STATUS</label>
            <Select
              value={currentNode?.status}
              onValueChange={(v) => setCurrentNode((prev: any) => ({ ...prev!, status: v as MemoryStatus }))}
            >
              <SelectTrigger className={`mt-1 border-slate-700 bg-slate-950 text-xs ${
                currentNode?.status === "injected" ? "text-red-400" : ""
              }`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-900">
                {MEMORY_STATUSES.map((status) => (
                  <SelectItem 
                    key={status} 
                    value={status}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: STATUS_COLORS[status] }}>
                        {statusIcons[status]}
                      </span>
                      <span className="capitalize">{status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trust Score */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">TRUST SCORE</label>
            <span className="text-xs font-mono text-cyan-400">{currentNode?.trustScore}%</span>
          </div>
          <Slider
            value={[currentNode?.trustScore || 50]}
            onValueChange={(v) => setCurrentNode((prev: any) => ({ ...prev!, trustScore: (v as number[])[0] }))}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] font-bold text-slate-500">TAGS</label>
          <div className="mt-2 flex flex-wrap gap-1">
            {MEMORY_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={currentNode?.tags?.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer text-[10px] ${
                  currentNode?.tags?.includes(tag)
                    ? "bg-cyan-500/30 text-cyan-300"
                    : "border-slate-700 text-slate-500 hover:border-cyan-500/30"
                }`}
                onClick={() => {
                  const currentTags = currentNode?.tags || [];
                  const newTags = currentTags.includes(tag)
                    ? currentTags.filter((t) => t !== tag)
                    : [...currentTags, tag];
                  setCurrentNode((prev: any) => ({ ...prev!, tags: newTags }));
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Node ID (read-only for existing) */}
        {!isCreating && editedNode && (
          <div>
            <label className="text-[10px] font-bold text-slate-500">NODE ID</label>
            <div className="mt-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-[10px] font-mono text-slate-600">
              {editedNode.id}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={handleSave}
          className="w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30"
        >
          <Save className="mr-2 h-4 w-4" />
          {isCreating ? "CREATE MEMORY" : "SAVE CHANGES"}
        </Button>
      </div>
    </Card>
  );
}
