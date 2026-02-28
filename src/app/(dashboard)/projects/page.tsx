"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FolderKanban,
  FileText,
  Trash2,
} from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import {
  getProjects,
  createProject,
  deleteProject,
  type ProjectWithCount,
} from "@/lib/projects/actions";

const STATUS_LABELS: Record<string, string> = {
  planning: "計画中",
  in_progress: "進行中",
  completed: "完了",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  planning: "outline",
  in_progress: "secondary",
  completed: "default",
};

export default function ProjectsPage() {
  const { isReady } = useDatabaseStatus();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const all = await getProjects(db);
      setProjects(all);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await createProject(db, { title: newTitle, description: newDesc || undefined });
      setNewTitle("");
      setNewDesc("");
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await deleteProject(db, id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">プロジェクト</h2>
          <p className="text-muted-foreground">
            論文・ノートをプロジェクトで整理
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          新規プロジェクト
        </Button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">タイトル</Label>
              <Input
                id="project-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="プロジェクト名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">説明（任意）</Label>
              <Input
                id="project-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="プロジェクトの概要"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                {creating ? "作成中..." : "作成"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && !showForm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              プロジェクトを作成して論文やノートを整理しましょう
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleDelete(e, project.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description || "説明なし"}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {project.entryCount} エントリ
                    </span>
                    <Badge variant={STATUS_VARIANT[project.status] ?? "outline"}>
                      {STATUS_LABELS[project.status] ?? project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
