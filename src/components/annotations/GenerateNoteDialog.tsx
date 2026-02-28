"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Check } from "lucide-react";
import { ANNOTATION_COLORS, NOTE_TYPES, type AnnotationColor, type NoteType } from "@/types";
import type { Annotation } from "@/lib/annotations/actions";
import { createNote } from "@/lib/notes/actions";

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  summary: "要約",
  concept: "概念",
  reflection: "考察",
  critique: "批評",
};

const COLOR_DOT: Record<AnnotationColor, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  gray: "bg-gray-400",
};

interface GenerateNoteDialogProps {
  annotations: Annotation[];
  paperId: string;
  paperTitle: string;
  paperAbstract?: string;
  onClose: () => void;
}

export default function GenerateNoteDialog({
  annotations,
  paperId,
  paperTitle,
  paperAbstract,
  onClose,
}: GenerateNoteDialogProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(annotations.map((a) => a.id)),
  );
  const [noteType, setNoteType] = useState<NoteType>("summary");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAnnotation = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    const selectedAnnotations = annotations.filter((a) =>
      selectedIds.has(a.id),
    );
    if (selectedAnnotations.length === 0) return;

    setGenerating(true);
    setError(null);

    try {
      // Call edge function for note generation
      const response = await fetch("/api/edge/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annotations: selectedAnnotations,
          noteType,
          paperTitle,
          paperAbstract,
        }),
      });

      if (!response.ok) {
        throw new Error("ノート生成に失敗しました");
      }

      const { content } = await response.json();

      // Save note to DB
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) throw new Error("DB not ready");

      const note = await createNote(db, {
        title: `${paperTitle} - ${NOTE_TYPE_LABELS[noteType]}`,
        noteType,
        paperId,
        content,
        annotationIds: Array.from(selectedIds),
      });

      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ノート生成に失敗しました",
      );
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI ノート生成
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            閉じる
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ノートタイプ</label>
          <Select
            value={noteType}
            onValueChange={(v) => setNoteType(v as NoteType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {NOTE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              アノテーション選択 ({selectedIds.size}/{annotations.length})
            </label>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                if (selectedIds.size === annotations.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(annotations.map((a) => a.id)));
                }
              }}
            >
              {selectedIds.size === annotations.length
                ? "全解除"
                : "全選択"}
            </Button>
          </div>

          <div className="max-h-64 overflow-auto space-y-1 rounded-md border p-2">
            {annotations.map((annotation) => {
              const color = annotation.color as AnnotationColor;
              const isSelected = selectedIds.has(annotation.id);
              return (
                <button
                  key={annotation.id}
                  onClick={() => toggleAnnotation(annotation.id)}
                  className={`flex w-full items-start gap-2 rounded-md p-2 text-left text-xs transition-colors ${
                    isSelected ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded border" />
                    )}
                  </div>
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 mt-0.5 ${COLOR_DOT[color]}`}
                  />
                  <div className="flex-1 min-w-0">
                    {annotation.text && (
                      <p className="text-muted-foreground line-clamp-1">
                        {annotation.text}
                      </p>
                    )}
                    {annotation.comment && (
                      <p className="font-medium">{annotation.comment}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {ANNOTATION_COLORS[color].label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={generating}>
            キャンセル
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedIds.size === 0 || generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                ノートを生成
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
