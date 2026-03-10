"use client";

import { MemoryNode, MemorySource, MemoryStatus, MemoryTag } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const SOURCE_LABELS: Record<MemorySource, string> = {
  system: "система",
  user: "пользователь",
  upload: "загрузка",
  injected: "инъекция",
  derived: "выведено",
};

const STATUS_LABELS: Record<MemoryStatus, string> = {
  trusted: "доверенный",
  unverified: "неверифицирован",
  injected: "инжектирован",
  conflicting: "конфликт",
};

const TAG_LABELS: Record<MemoryTag, string> = {
  identity: "идентичность",
  security: "безопасность",
  project: "проект",
  user_preference: "предпочтения",
  fact: "факт",
  policy: "политика",
};

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
      <div className="h-full flex flex-col items-center justify-center text-center bg-slate-900/50">
        <div className="mb-3 rounded-full bg-slate-800 p-3">
          <ShieldAlert className="h-6 w-6 text-slate-600" />
        </div>
        <h3 className="text-xs font-bold text-slate-400">ВОСПОМИНАНИЕ НЕ ВЫБРАНО</h3>
        <p className="mt-1 text-[10px] text-slate-500 leading-tight">
          Кликните на узел или создайте новое
        </p>
        <Button
          onClick={() => setIsCreating(true)}
          className="mt-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 h-8 text-xs"
          variant="outline"
          size="sm"
        >
          <Plus className="mr-1 h-3 w-3" />
          СОЗДАТЬ
        </Button>
      </div>
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
    trusted: <CheckCircle className="h-3 w-3" />,
    unverified: <HelpCircle className="h-3 w-3" />,
    injected: <ShieldAlert className="h-3 w-3" />,
    conflicting: <AlertTriangle className="h-3 w-3" />,
  };

  return (
    <div className={`h-full flex flex-col ${
      currentNode?.status === "injected" 
        ? "bg-red-950/10" 
        : ""
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-xs font-bold text-cyan-400">
          {isCreating ? "/НОВОЕ" : "/РЕДАКТИРОВАНИЕ"}
        </h3>
        <div className="flex gap-1">
          {!isCreating && (
            <Button
              onClick={handleDelete}
              variant="outline"
              size="icon"
              className="h-7 w-7 border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            onClick={() => {
              setIsCreating(false);
              onClose();
            }}
            variant="outline"
            size="icon"
            className="h-7 w-7 border-slate-600 text-slate-400"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Scrollable content - скрываем скроллбар как в чате */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        <div className="space-y-2 pb-2">
          {/* Title */}
          <div>
            <label className="text-[9px] font-bold text-slate-500">НАЗВАНИЕ</label>
            <Input
              value={currentNode?.title || ""}
              onChange={(e) => setCurrentNode((prev: any) => ({ ...prev!, title: e.target.value }))}
              className="mt-0.5 h-8 border-slate-700 bg-slate-950 text-xs text-slate-200"
              placeholder="Название..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[9px] font-bold text-slate-500">СОДЕРЖАНИЕ</label>
            <Textarea
              value={currentNode?.content || ""}
              onChange={(e) => setCurrentNode((prev: any) => ({ ...prev!, content: e.target.value }))}
              className="mt-0.5 min-h-[60px] border-slate-700 bg-slate-950 text-xs text-slate-200 resize-none"
              placeholder="Содержание..."
            />
          </div>

          {/* Source & Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-slate-500">ИСТОЧНИК</label>
              <Select
                value={currentNode?.source || "user"}
                onValueChange={(v) => setCurrentNode((prev: any) => ({ ...prev!, source: v as MemorySource }))}
              >
                <SelectTrigger className="mt-0.5 h-8 border-slate-700 bg-slate-950 text-xs">
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
                        <span>{SOURCE_LABELS[source]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500">СТАТУС</label>
              <Select
                value={currentNode?.status || "unverified"}
                onValueChange={(v) => setCurrentNode((prev: any) => ({ ...prev!, status: v as MemoryStatus }))}
              >
                <SelectTrigger className={`mt-0.5 h-8 border-slate-700 bg-slate-950 text-xs ${
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
                        <span>{STATUS_LABELS[status]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[9px] font-bold text-slate-500">ТЕГИ</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {MEMORY_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={currentNode?.tags?.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer text-[9px] px-1.5 py-0 h-5 ${
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
                  {TAG_LABELS[tag]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button - фиксирован внизу */}
      <div className="shrink-0 pt-2 border-t border-slate-700/30">
        <Button
          onClick={handleSave}
          className="w-full h-8 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs"
        >
          <Save className="mr-1 h-3 w-3" />
          {isCreating ? "СОЗДАТЬ" : "СОХРАНИТЬ"}
        </Button>
      </div>
    </div>
  );
}
