"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  FileText,
  StickyNote,
  FolderKanban,
  BookOpen,
  Plus,
} from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getPapers, type Paper } from "@/lib/papers/actions";

const PHASE_LABELS: Record<string, string> = {
  not_started: "未読",
  pass_1_overview: "Pass 1/4",
  pass_2_conclusion: "Pass 2/4",
  pass_3_data: "Pass 3/4",
  pass_4_deep: "Pass 4/4",
  completed: "読了",
};

function phaseProgress(phase: string): number {
  const map: Record<string, number> = {
    not_started: 0,
    pass_1_overview: 1,
    pass_2_conclusion: 2,
    pass_3_data: 3,
    pass_4_deep: 4,
    completed: 4,
  };
  return map[phase] ?? 0;
}

export default function DashboardPage() {
  const { isReady } = useDatabaseStatus();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const allPapers = await getPapers(db);
      setPapers(allPapers);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completedPapers = papers.filter(
    (p) => p.readingPhase === "completed",
  ).length;
  const inProgressPapers = papers.filter(
    (p) => p.readingPhase !== "not_started" && p.readingPhase !== "completed",
  );

  if (!isReady || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ダッシュボード</h2>
          <p className="text-muted-foreground">
            学習の進捗と概要
          </p>
        </div>
        <Button asChild>
          <Link href="/papers/new">
            <Plus className="mr-2 h-4 w-4" />
            論文を登録
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">論文数</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedPapers} 件読了
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">読解中</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressPapers.length}</div>
            <p className="text-xs text-muted-foreground">4-Pass 進行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ノート数</CardTitle>
            <StickyNote className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Phase 3 で実装</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">プロジェクト</CardTitle>
            <FolderKanban className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Phase 6 で実装</p>
          </CardContent>
        </Card>
      </div>

      {/* Reading Progress */}
      {inProgressPapers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              読解進捗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressPapers.map((paper) => {
                const progress = phaseProgress(paper.readingPhase);
                return (
                  <Link
                    key={paper.id}
                    href={`/papers/${paper.id}/read`}
                    className="block space-y-1 rounded-md p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">
                        {paper.title}
                      </span>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {PHASE_LABELS[paper.readingPhase] ?? "未読"}
                      </Badge>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(progress / 4) * 100}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {papers.length === 0
                ? "論文を登録して学習を始めましょう"
                : "すべての論文の読解が完了しています"}
            </p>
            {papers.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/papers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  最初の論文を登録
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Papers */}
      {papers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              最近の論文
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {papers.slice(0, 5).map((paper) => (
                <Link
                  key={paper.id}
                  href={`/papers/${paper.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {paper.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {paper.authors
                        ? (paper.authors as string[]).join(", ")
                        : "著者不明"}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {PHASE_LABELS[paper.readingPhase] ?? "未読"}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
