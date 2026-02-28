"use client";

import { useState, useRef, useCallback } from "react";
import type { GraphNode, GraphEdge } from "@/lib/graph/layout";

const NODE_COLORS: Record<GraphNode["type"], string> = {
  paper: "#3b82f6",   // blue
  note: "#eab308",    // yellow
  project: "#a855f7", // purple
};

const NODE_RADIUS = 18;

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

export default function KnowledgeGraph({
  nodes,
  edges,
  width = 800,
  height = 600,
  onNodeClick,
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Pan & zoom: track offset and scale relative to base dimensions
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const viewBox = {
    x: panOffset.x,
    y: panOffset.y,
    w: width * zoomScale,
    h: height * zoomScale,
  };

  // Build node lookup for edge rendering
  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      setZoomScale((z) => Math.max(0.2, Math.min(5, z * factor)));
    },
    [],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as SVGElement).closest(".graph-node")) return;
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: panOffset.x,
        oy: panOffset.y,
      };
    },
    [panOffset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx =
        ((e.clientX - panStart.current.x) / rect.width) * viewBox.w;
      const dy =
        ((e.clientY - panStart.current.y) / rect.height) * viewBox.h;
      setPanOffset({
        x: panStart.current.ox - dx,
        y: panStart.current.oy - dy,
      });
    },
    [isPanning, viewBox.w, viewBox.h],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedId(node.id === selectedId ? null : node.id);
      onNodeClick?.(node);
    },
    [selectedId, onNodeClick],
  );

  if (nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ width, height }}
      >
        <p className="text-sm">データがありません</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="cursor-grab select-none"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Edges */}
        {edges.map((edge) => {
          const src = nodeMap.get(edge.source);
          const tgt = nodeMap.get(edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={edge.id}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedId;
          const color = NODE_COLORS[node.type];
          return (
            <g
              key={node.id}
              className="graph-node cursor-pointer"
              onClick={() => handleNodeClick(node)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill={color}
                fillOpacity={0.85}
                stroke={isSelected ? "#fff" : color}
                strokeWidth={isSelected ? 3 : 1.5}
              />
              <text
                x={node.x}
                y={node.y + NODE_RADIUS + 14}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                className="pointer-events-none"
              >
                {node.label.length > 20
                  ? node.label.slice(0, 18) + "..."
                  : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-md bg-background/80 px-3 py-1.5 text-xs backdrop-blur">
        {(
          [
            ["paper", "論文"],
            ["note", "ノート"],
            ["project", "プロジェクト"],
          ] as const
        ).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: NODE_COLORS[type] }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
