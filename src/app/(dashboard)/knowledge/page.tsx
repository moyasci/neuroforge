"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, Layout, Search, FileText, StickyNote, MessageSquare, FolderKanban } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getPapers } from "@/lib/papers/actions";
import { getNotes } from "@/lib/notes/actions";
import { getProjects } from "@/lib/projects/actions";
import { getAnnotations } from "@/lib/annotations/actions";
import { computeLayout, type GraphNode, type GraphEdge } from "@/lib/graph/layout";
import KnowledgeGraph from "@/components/knowledge/KnowledgeGraph";

export default function KnowledgePage() {
  const { isReady } = useDatabaseStatus();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    papers: 0,
    notes: 0,
    annotations: 0,
    projects: 0,
  });
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

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

      // Count annotations across all papers
      let annotationCount = 0;
      for (const paper of allPapers) {
        const annotations = await getAnnotations(db, paper.id);
        annotationCount += annotations.length;
      }

      setStats({
        papers: allPapers.length,
        notes: allNotes.length,
        annotations: annotationCount,
        projects: allProjects.length,
      });

      // Build graph nodes
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
        // Edge: note → paper (if linked)
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

      // Compute layout
      const w = graphContainerRef.current?.clientWidth || 800;
      const h = 500;
      computeLayout(nodes, edges, w, h);

      setGraphNodes(nodes);
      setGraphEdges(edges);
    } catch (err) {
      console.error("Failed to load knowledge stats:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  if (!isReady || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const nodeLink = selectedNode
    ? selectedNode.type === "paper"
      ? `/papers/${selectedNode.id}`
      : selectedNode.type === "note"
        ? `/notes/${selectedNode.id}`
        : `/projects/${selectedNode.id}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ナレッジグラフ</h2>
          <p className="text-muted-foreground">
            概念間の関係を可視化・探索
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/knowledge/canvas">
              <Layout className="mr-2 h-4 w-4" />
              Canvas
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              横断検索
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.papers}</p>
              <p className="text-sm text-muted-foreground">論文</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <StickyNote className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.notes}</p>
              <p className="text-sm text-muted-foreground">ノート</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.annotations}</p>
              <p className="text-sm text-muted-foreground">アノテーション</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <FolderKanban className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.projects}</p>
              <p className="text-sm text-muted-foreground">プロジェクト</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graph Container */}
      <Card>
        <CardContent className="p-0" ref={graphContainerRef}>
          {graphNodes.length > 0 ? (
            <div className="relative">
              <KnowledgeGraph
                nodes={graphNodes}
                edges={graphEdges}
                width={graphContainerRef.current?.clientWidth || 800}
                height={500}
                onNodeClick={handleNodeClick}
              />
              {selectedNode && nodeLink && (
                <div className="absolute right-3 top-3 rounded-md border bg-background p-3 shadow-sm">
                  <p className="text-sm font-medium">{selectedNode.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedNode.type === "paper"
                      ? "論文"
                      : selectedNode.type === "note"
                        ? "ノート"
                        : "プロジェクト"}
                  </p>
                  <Button variant="link" size="sm" className="mt-1 h-auto p-0" asChild>
                    <Link href={nodeLink}>詳細を表示</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[500px] items-center justify-center">
              <div className="text-center">
                <Network className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  ナレッジグラフ
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  論文やノートを追加するとグラフが表示されます
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
