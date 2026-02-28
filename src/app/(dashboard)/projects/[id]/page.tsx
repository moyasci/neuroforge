"use client";

import { use, useEffect, useState, useCallback } from "react";
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
  ArrowLeft,
  Plus,
  FileText,
  StickyNote,
  Calendar,
  Code,
  Paintbrush,
  FlaskConical,
  Trash2,
} from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import {
  getProject,
  createProjectEntry,
  deleteProjectEntry,
  updateProject,
  type Project,
  type ProjectEntry,
} from "@/lib/projects/actions";
import type { ProjectStatus } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  planning: "計画中",
  in_progress: "進行中",
  completed: "完了",
};

const ENTRY_TYPE_ICONS: Record<string, typeof FileText> = {
  code: Code,
  note: StickyNote,
  design: Paintbrush,
  simulation: FlaskConical,
};

const ENTRY_TYPES = [
  { value: "note", label: "ノート" },
  { value: "code", label: "コード" },
  { value: "design", label: "デザイン" },
  { value: "simulation", label: "シミュレーション" },
] as const;

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReady } = useDatabaseStatus();
  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<ProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryType, setEntryType] = useState<"code" | "note" | "design" | "simulation">("note");
  const [entryContent, setEntryContent] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const result = await getProject(db, id);
      if (result) {
        setProject(result.project);
        setEntries(result.entries);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateEntry = async () => {
    if (!entryTitle.trim()) return;
    setCreating(true);
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await createProjectEntry(db, {
        projectId: id,
        type: entryType,
        title: entryTitle,
        content: entryContent || undefined,
      });
      setEntryTitle("");
      setEntryContent("");
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create entry:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await deleteProjectEntry(db, entryId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await updateProject(db, id, { status });
      await loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">プロジェクトが見つかりません</p>
        <Button asChild className="mt-4">
          <Link href="/projects">プロジェクト一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {project.title}
          </h2>
          <p className="text-muted-foreground">
            {project.description || "説明なし"}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          エントリ追加
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">エントリ数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">作成日</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(project.createdAt).toLocaleDateString("ja-JP")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {(["planning", "in_progress", "completed"] as const).map((s) => (
                <Button
                  key={s}
                  variant={project.status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(s)}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>タイプ</Label>
              <div className="flex gap-2">
                {ENTRY_TYPES.map((t) => (
                  <Button
                    key={t.value}
                    variant={entryType === t.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEntryType(t.value)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-title">タイトル</Label>
              <Input
                id="entry-title"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="エントリのタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-content">内容（任意）</Label>
              <Input
                id="entry-content"
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="内容やメモ"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateEntry} disabled={creating || !entryTitle.trim()}>
                {creating ? "追加中..." : "追加"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>エントリ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              エントリがありません。「エントリ追加」で作成しましょう。
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const Icon = ENTRY_TYPE_ICONS[entry.type] ?? FileText;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{entry.title}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.type}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
