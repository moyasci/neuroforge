"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ANNOTATION_COLORS, type AnnotationColor } from "@/types";
import { MessageSquare, X } from "lucide-react";

const COLOR_BG: Record<AnnotationColor, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  gray: "bg-gray-400",
};

const COLOR_RING: Record<AnnotationColor, string> = {
  red: "ring-red-500",
  yellow: "ring-yellow-500",
  green: "ring-green-500",
  purple: "ring-purple-500",
  blue: "ring-blue-500",
  orange: "ring-orange-500",
  gray: "ring-gray-400",
};

interface AnnotationToolbarProps {
  selectedText: string | null;
  onAnnotate: (color: AnnotationColor, comment?: string) => void;
  onCancel: () => void;
}

export default function AnnotationToolbar({
  selectedText,
  onAnnotate,
  onCancel,
}: AnnotationToolbarProps) {
  const [selectedColor, setSelectedColor] = useState<AnnotationColor>("yellow");
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);

  if (!selectedText) return null;

  const handleAnnotate = () => {
    onAnnotate(selectedColor, comment || undefined);
    setComment("");
    setShowComment(false);
  };

  return (
    <div className="border rounded-lg bg-card p-3 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground line-clamp-1 flex-1 mr-2">
          &ldquo;{selectedText}&rdquo;
        </p>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-1.5">
        {(Object.keys(ANNOTATION_COLORS) as AnnotationColor[]).map((color) => (
          <button
            key={color}
            title={`${ANNOTATION_COLORS[color].label}: ${ANNOTATION_COLORS[color].description}`}
            className={`h-6 w-6 rounded-full ${COLOR_BG[color]} transition-all ${
              selectedColor === color ? `ring-2 ring-offset-2 ${COLOR_RING[color]}` : "hover:scale-110"
            }`}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {ANNOTATION_COLORS[selectedColor].label} &mdash;{" "}
        {ANNOTATION_COLORS[selectedColor].description}
      </p>

      {/* Comment Toggle + Input */}
      {showComment ? (
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="コメントを入力..."
          className="text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAnnotate();
          }}
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setShowComment(true)}
        >
          <MessageSquare className="mr-1 h-3 w-3" />
          コメントを追加
        </Button>
      )}

      <Button size="sm" className="w-full" onClick={handleAnnotate}>
        ハイライト
      </Button>
    </div>
  );
}
