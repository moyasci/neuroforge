"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Network,
  User,
  Tag,
  Trash2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useDatabase, useDatabaseStatus } from "@/db/provider";
import { getPaper, deletePaper } from "@/lib/papers/actions";
import type { Paper } from "@/lib/papers/actions";
import { getReadingSessionsForPaper } from "@/lib/reading/actions";
import type { ReadingSession } from "@/lib/reading/actions";
import type { PaperField, ReadingPhase } from "@/types";

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

const PASS_NAMES = [
  { phase: "pass_1_overview", label: "Pass 1: 概観" },
  { phase: "pass_2_conclusion", label: "Pass 2: 結論確認" },
  { phase: "pass_3_data", label: "Pass 3: データ解析" },
  { phase: "pass_4_deep", label: "Pass 4: 詳細精読" },
];

const PHASE_ORDER: ReadingPhase[] = [
  "not_started",
  "pass_1_overview",
  "pass_2_conclusion",
  "pass_3_data",
  "pass_4_deep",
  "completed",
];

function isPassCompleted(paperPhase: ReadingPhase, passPhase: string): boolean {
  const paperIndex = PHASE_ORDER.indexOf(paperPhase);
  const passIndex = PHASE_ORDER.indexOf(passPhase as ReadingPhase);
  return paperIndex > passIndex;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

export default function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReady } = useDatabaseStatus();

  if (!isReady) {
    return <DetailSkeleton />;
  }

  return <PaperDetail id={id} />;
}

function PaperDetail({ id }: { id: string }) {
  const db = useDatabase();
  const router = useRouter();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getPaper(db, id);
        if (!result) {
          setNotFound(true);
          return;
        }
        setPaper(result);
        const readingSessions = await getReadingSessionsForPaper(db, id);
        setSessions(readingSessions);
      } catch (err) {
        console.error("Failed to load paper:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db, id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (notFound || !paper) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/papers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">論文が見つかりません</h2>
        </div>
        <p className="text-muted-foreground">
          指定された論文は存在しないか、削除された可能性があります。
        </p>
        <Button asChild>
          <Link href="/papers">論文一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  const totalSeconds = sessions.reduce(
    (sum, s) => sum + (s.durationSeconds ?? 0),
    0,
  );

  const handleDelete = async () => {
    if (!window.confirm("この論文を削除しますか？この操作は取り消せません。")) {
      return;
    }
    try {
      await deletePaper(db, paper.id);
      router.push("/papers");
    } catch (err) {
      console.error("Failed to delete paper:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/papers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{paper.title}</h2>
          <p className="text-muted-foreground">
            {(paper.authors as string[])?.join(", ") || "著者不明"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/papers/${id}/read`}>
            <BookOpen className="mr-2 h-4 w-4" />
            4-Pass 読解を開始
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/reading/${id}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            没入読解モード
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/papers/${id}/network`}>
            <Network className="mr-2 h-4 w-4" />
            引用ネットワーク
          </Link>
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {paper.abstract && (
            <Card>
              <CardHeader>
                <CardTitle>アブストラクト</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {paper.abstract}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メタデータ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{(paper.authors as string[])?.join(", ") || "著者不明"}</span>
              </div>
              {paper.field && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">
                    {FIELD_LABELS[paper.field as PaperField] ?? paper.field}
                  </Badge>
                </div>
              )}
              {(paper.tags as string[])?.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {(paper.tags as string[]).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {paper.doi && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {paper.doi}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant={
                    paper.readingPhase === "not_started"
                      ? "outline"
                      : paper.readingPhase === "completed"
                        ? "default"
                        : "secondary"
                  }
                >
                  {PHASE_LABEL[paper.readingPhase as ReadingPhase] ?? paper.readingPhase}
                </Badge>
              </div>
              {totalSeconds > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>合計読書時間: {formatDuration(totalSeconds)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>読解進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PASS_NAMES.map(({ phase, label }) => {
                  const completed = isPassCompleted(
                    paper.readingPhase as ReadingPhase,
                    phase,
                  );
                  return (
                    <div
                      key={phase}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{label}</span>
                      <Badge variant={completed ? "default" : "outline"}>
                        {completed ? "完了" : "未着手"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
