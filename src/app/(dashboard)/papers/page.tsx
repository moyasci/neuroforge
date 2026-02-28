"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, User } from "lucide-react";
import { useDatabase, useDatabaseStatus } from "@/db/provider";
import { getPapers, getPapersByField, deletePaper } from "@/lib/papers/actions";
import type { Paper } from "@/lib/papers/actions";
import { PAPER_FIELDS, type PaperField, type ReadingPhase } from "@/types";

const FIELD_LABELS: Record<PaperField, string> = {
  neuroscience: "神経科学",
  cell_biology: "細胞生物学",
  psychology: "心理学",
  engineering: "工学",
  ai: "AI",
  interdisciplinary: "学際",
};

const PHASE_LABEL: Record<ReadingPhase, string> = {
  not_started: "未読",
  pass_1_overview: "Pass 1",
  pass_2_conclusion: "Pass 2",
  pass_3_data: "Pass 3",
  pass_4_deep: "Pass 4",
  completed: "読了",
};

const PHASE_VARIANT: Record<ReadingPhase, "outline" | "secondary" | "default"> = {
  not_started: "outline",
  pass_1_overview: "secondary",
  pass_2_conclusion: "secondary",
  pass_3_data: "secondary",
  pass_4_deep: "secondary",
  completed: "default",
};

export default function PapersPage() {
  const { isReady } = useDatabaseStatus();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [activeField, setActiveField] = useState<PaperField | "all">("all");
  const [loading, setLoading] = useState(true);

  const loadPapers = useCallback(async (db: ReturnType<typeof useDatabase>) => {
    setLoading(true);
    try {
      const result =
        activeField === "all"
          ? await getPapers(db)
          : await getPapersByField(db, activeField);
      setPapers(result);
    } catch (err) {
      console.error("Failed to load papers:", err);
    } finally {
      setLoading(false);
    }
  }, [activeField]);

  return (
    <PapersContent
      isReady={isReady}
      papers={papers}
      activeField={activeField}
      setActiveField={setActiveField}
      loading={loading}
      loadPapers={loadPapers}
    />
  );
}

function PapersContent({
  isReady,
  papers,
  activeField,
  setActiveField,
  loading,
  loadPapers,
}: {
  isReady: boolean;
  papers: Paper[];
  activeField: PaperField | "all";
  setActiveField: (field: PaperField | "all") => void;
  loading: boolean;
  loadPapers: (db: ReturnType<typeof useDatabase>) => Promise<void>;
}) {
  // Only call useDatabase when isReady is true by lifting it here
  // We need a child component that can safely call useDatabase
  if (!isReady) {
    return <LoadingSkeleton />;
  }

  return <PapersReady papers={papers} activeField={activeField} setActiveField={setActiveField} loading={loading} loadPapers={loadPapers} />;
}

function PapersReady({
  papers,
  activeField,
  setActiveField,
  loading,
  loadPapers,
}: {
  papers: Paper[];
  activeField: PaperField | "all";
  setActiveField: (field: PaperField | "all") => void;
  loading: boolean;
  loadPapers: (db: ReturnType<typeof useDatabase>) => Promise<void>;
}) {
  const db = useDatabase();

  useEffect(() => {
    loadPapers(db);
  }, [db, loadPapers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">論文</h2>
          <p className="text-muted-foreground">登録済み論文の一覧と管理</p>
        </div>
        <Button asChild>
          <Link href="/papers/new">
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Link>
        </Button>
      </div>

      <Tabs
        value={activeField}
        onValueChange={(v) => setActiveField(v as PaperField | "all")}
      >
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          {PAPER_FIELDS.map((field) => (
            <TabsTrigger key={field} value={field}>
              {FIELD_LABELS[field]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingSkeleton cardsOnly />
      ) : papers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            論文がまだ登録されていません
          </p>
          <Button asChild className="mt-4">
            <Link href="/papers/new">
              <Plus className="mr-2 h-4 w-4" />
              最初の論文を登録する
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <Link key={paper.id} href={`/papers/${paper.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">
                      {paper.title}
                    </CardTitle>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {(paper.authors as string[])?.join(", ") || "著者不明"}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {paper.field && (
                        <Badge variant="outline">
                          {FIELD_LABELS[paper.field as PaperField] ?? paper.field}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          PHASE_VARIANT[paper.readingPhase as ReadingPhase] ?? "outline"
                        }
                      >
                        {PHASE_LABEL[paper.readingPhase as ReadingPhase] ?? paper.readingPhase}
                      </Badge>
                    </div>
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

function LoadingSkeleton({ cardsOnly = false }: { cardsOnly?: boolean }) {
  return (
    <div className="space-y-6">
      {!cardsOnly && (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <Skeleton className="h-10 w-full max-w-xl" />
        </>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
