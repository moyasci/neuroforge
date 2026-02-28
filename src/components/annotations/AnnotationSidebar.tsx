"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileText } from "lucide-react";
import { ANNOTATION_COLORS, type AnnotationColor } from "@/types";
import type { Annotation } from "@/lib/annotations/actions";

const COLOR_DOT: Record<AnnotationColor, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  gray: "bg-gray-400",
};

interface AnnotationSidebarProps {
  annotations: Annotation[];
  onDelete: (id: string) => void;
  onConvertToNote?: (annotations: Annotation[]) => void;
}

export default function AnnotationSidebar({
  annotations,
  onDelete,
  onConvertToNote,
}: AnnotationSidebarProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Annotation[]> = {};
    for (const a of annotations) {
      const color = a.color;
      if (!groups[color]) groups[color] = [];
      groups[color].push(a);
    }
    return groups;
  }, [annotations]);

  if (annotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <p className="text-sm text-muted-foreground">
          アノテーションがありません
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          テキストを選択してハイライトできます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          アノテーション ({annotations.length})
        </p>
        {onConvertToNote && annotations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onConvertToNote(annotations)}
          >
            <FileText className="mr-1 h-3 w-3" />
            ノートに変換
          </Button>
        )}
      </div>

      {(Object.keys(ANNOTATION_COLORS) as AnnotationColor[]).map((color) => {
        const items = grouped[color];
        if (!items || items.length === 0) return null;

        return (
          <div key={color} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${COLOR_DOT[color]}`}
              />
              <span className="text-xs font-medium">
                {ANNOTATION_COLORS[color].label}
              </span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {items.length}
              </Badge>
            </div>
            {items.map((annotation) => (
              <div
                key={annotation.id}
                className="ml-4 rounded-md border p-2 text-xs space-y-1 group"
              >
                {annotation.text && (
                  <p className="text-muted-foreground line-clamp-2">
                    &ldquo;{annotation.text}&rdquo;
                  </p>
                )}
                {annotation.comment && (
                  <p className="font-medium">{annotation.comment}</p>
                )}
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onDelete(annotation.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
