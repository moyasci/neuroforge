"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Layout, MousePointer2, Link2 } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getPapers } from "@/lib/papers/actions";
import { getNotes } from "@/lib/notes/actions";
import { getProjects } from "@/lib/projects/actions";
import { computeLayout, type GraphNode, type GraphEdge } from "@/lib/graph/layout";
import KnowledgeGraph from "@/components/knowledge/KnowledgeGraph";

type CanvasMode = "select" | "connect";

export default function CanvasPage() {
  const { isReady } = useDatabaseStatus();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<CanvasMode>("select");
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;

      const [allPapers, allNotes, allProjects] = await Promise.all([
        getPapers(db),
        getNotes(db),
        getProjects(db),
      ]);

      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];

      for (const paper of allPapers) {
        nodes.push({
          id: paper.id,
          type: "paper",
          label: paper.title,
          x: 0, y: 0, vx: 0, vy: 0,
        });
      }
      for (const note of allNotes) {
        nodes.push({
          id: note.id,
          type: "note",
          label: note.title,
          x: 0, y: 0, vx: 0, vy: 0,
        });
        if (note.paperId) {
          edges.push({
            id: `note-${note.id}-paper-${note.paperId}`,
            source: note.id,
            target: note.paperId,
          });
        }
      }
      for (const project of allProjects) {
        nodes.push({
          id: project.id,
          type: "project",
          label: project.title,
          x: 0, y: 0, vx: 0, vy: 0,
        });
      }

      const w = containerRef.current?.clientWidth || 1000;
      const h = containerRef.current?.clientHeight || 600;
      computeLayout(nodes, edges, w, h);

      setGraphNodes(nodes);
      setGraphEdges(edges);
    } catch (err) {
      console.error("Failed to load canvas data:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNodeClick = useCallback(() => {
    // Future: show node details panel
  }, []);

  if (!isReady || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[calc(100vh-12rem)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/knowledge">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Canvas ワークスペース
            </h2>
            <p className="text-sm text-muted-foreground">
              自由にノードを配置して知識を整理
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button
            variant={mode === "select" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMode("select")}
            title="選択モード"
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === "connect" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMode("connect")}
            title="接続モード"
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0" ref={containerRef}>
          {graphNodes.length > 0 ? (
            <KnowledgeGraph
              nodes={graphNodes}
              edges={graphEdges}
              width={containerRef.current?.clientWidth || 1000}
              height={Math.max(
                500,
                (containerRef.current?.clientHeight || 600) - 16,
              )}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
              <div className="text-center">
                <Layout className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  Canvas ワークスペース
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  論文やノートを追加するとここに表示されます
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
