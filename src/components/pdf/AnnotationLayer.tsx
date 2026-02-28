"use client";

import { useState } from "react";
import type { Annotation } from "@/lib/annotations/actions";
import type { AnnotationColor } from "@/types";

const COLOR_MAP: Record<AnnotationColor, string> = {
  red: "rgba(239, 68, 68, 0.3)",
  yellow: "rgba(234, 179, 8, 0.3)",
  green: "rgba(34, 197, 94, 0.3)",
  purple: "rgba(168, 85, 247, 0.3)",
  blue: "rgba(59, 130, 246, 0.3)",
  orange: "rgba(249, 115, 22, 0.3)",
  gray: "rgba(156, 163, 175, 0.3)",
};

const COLOR_BORDER_MAP: Record<AnnotationColor, string> = {
  red: "border-red-500",
  yellow: "border-yellow-500",
  green: "border-green-500",
  purple: "border-purple-500",
  blue: "border-blue-500",
  orange: "border-orange-500",
  gray: "border-gray-500",
};

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  onAnnotationClick?: (annotation: Annotation) => void;
}

interface AnnotationPosition {
  pageNumber: number;
  rects: { x: number; y: number; width: number; height: number }[];
}

export default function AnnotationLayer({
  annotations,
  pageNumber,
  onAnnotationClick,
}: AnnotationLayerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pageAnnotations = annotations.filter((a) => {
    const pos = a.position as AnnotationPosition | null;
    return pos?.pageNumber === pageNumber;
  });

  if (pageAnnotations.length === 0) return null;

  return (
    <>
      {pageAnnotations.map((annotation) => {
        const pos = annotation.position as AnnotationPosition;
        const color = annotation.color as AnnotationColor;

        return pos.rects.map((rect, i) => (
          <div
            key={`${annotation.id}-${i}`}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${rect.x}%`,
              top: `${rect.y}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
              backgroundColor: COLOR_MAP[color],
              mixBlendMode: "multiply",
            }}
            onClick={() => onAnnotationClick?.(annotation)}
            onMouseEnter={() => setHoveredId(annotation.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {hoveredId === annotation.id && annotation.comment && i === 0 && (
              <div
                className={`absolute top-full left-0 z-50 mt-1 max-w-xs rounded-md border-l-2 bg-popover p-2 text-xs shadow-md pointer-events-none ${COLOR_BORDER_MAP[color]}`}
              >
                {annotation.comment}
              </div>
            )}
          </div>
        ));
      })}
    </>
  );
}
