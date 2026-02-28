"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
  Timer,
} from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getPaper, type Paper } from "@/lib/papers/actions";
import {
  createReadingSession,
  updateReadingSessionDuration,
} from "@/lib/reading/actions";

const PHASE_LABELS: Record<string, string> = {
  not_started: "未開始",
  pass_1_overview: "Pass 1",
  pass_2_conclusion: "Pass 2",
  pass_3_data: "Pass 3",
  pass_4_deep: "Pass 4",
  completed: "読了",
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ImmersiveReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReady } = useDatabaseStatus();
  const [paper, setPaper] = useState<Paper | null>(null);

  // Timer state
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  // Pomodoro: 25 min default
  const [pomodoroTarget] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState(false);

  const loadPaper = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const result = await getPaper(db, id);
      if (result) setPaper(result);
    } catch (err) {
      console.error("Failed to load paper:", err);
    }
  }, [id, isReady]);

  useEffect(() => {
    loadPaper();
  }, [loadPaper]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          elapsedRef.current = next;
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Check pomodoro completion
  useEffect(() => {
    if (pomodoroMode && elapsed >= pomodoroTarget && isRunning) {
      setIsRunning(false);
      // Could play a sound or show notification here
    }
  }, [elapsed, pomodoroTarget, pomodoroMode, isRunning]);

  // Save session duration periodically (every 30 seconds)
  useEffect(() => {
    if (!isRunning || !sessionId) return;
    const saveInterval = setInterval(async () => {
      try {
        const db = (await import("@/db/pglite")).getDatabase();
        if (db) {
          await updateReadingSessionDuration(db, sessionId, elapsedRef.current);
        }
      } catch {
        // Silent fail for background save
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [isRunning, sessionId]);

  const startTimer = async () => {
    if (!paper) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (db && !sessionId) {
        const phaseMap: Record<string, "pass_1" | "pass_2" | "pass_3" | "pass_4"> = {
          pass_1_overview: "pass_1",
          pass_2_conclusion: "pass_2",
          pass_3_data: "pass_3",
          pass_4_deep: "pass_4",
        };
        const phase = phaseMap[paper.readingPhase] ?? "pass_1";
        const session = await createReadingSession(db, {
          paperId: paper.id,
          phase,
          focusMode: true,
        });
        setSessionId(session.id);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
    }
    setIsRunning(true);
  };

  const pauseTimer = async () => {
    setIsRunning(false);
    // Save current duration
    if (sessionId) {
      try {
        const db = (await import("@/db/pglite")).getDatabase();
        if (db) await updateReadingSessionDuration(db, sessionId, elapsed);
      } catch {
        // Silent
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setSessionId(null);
  };

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Skeleton className="h-16 w-64" />
      </div>
    );
  }

  const pomodoroProgress = pomodoroMode
    ? Math.min((elapsed / pomodoroTarget) * 100, 100)
    : 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Minimal Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/papers/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-sm font-medium">没入読解モード</p>
            <p className="text-xs text-muted-foreground truncate">
              {paper?.title ?? "読み込み中..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Pomodoro toggle */}
          <Button
            variant={pomodoroMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPomodoroMode(!pomodoroMode)}
          >
            <Timer className="mr-1 h-3 w-3" />
            25min
          </Button>

          {/* Timer display */}
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 min-w-[100px]">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">
              {pomodoroMode
                ? formatTime(Math.max(pomodoroTarget - elapsed, 0))
                : formatTime(elapsed)}
            </span>
          </div>

          {/* Timer controls */}
          {isRunning ? (
            <Button variant="outline" size="icon" onClick={pauseTimer}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="icon" onClick={startTimer}>
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Badge variant="secondary">
            {paper ? (PHASE_LABELS[paper.readingPhase] ?? "未開始") : "..."}
          </Badge>
        </div>
      </div>

      {/* Pomodoro progress bar */}
      {pomodoroMode && (
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${pomodoroProgress}%` }}
          />
        </div>
      )}

      {/* Reading Area */}
      <div className="flex flex-1 items-center justify-center bg-muted/20">
        {paper?.extractedText ? (
          <div className="mx-auto max-w-3xl overflow-auto p-8 h-full">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h1 className="text-xl">{paper.title}</h1>
              {paper.authors && (
                <p className="text-muted-foreground">
                  {(paper.authors as string[]).join(", ")}
                </p>
              )}
              <hr />
              <div className="whitespace-pre-wrap">{paper.extractedText}</div>
            </div>
          </div>
        ) : paper?.abstract ? (
          <div className="mx-auto max-w-3xl overflow-auto p-8 h-full">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h1 className="text-xl">{paper.title}</h1>
              {paper.authors && (
                <p className="text-muted-foreground">
                  {(paper.authors as string[]).join(", ")}
                </p>
              )}
              <hr />
              <h2>Abstract</h2>
              <p>{paper.abstract}</p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">
              没入読解ビューア
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF をアップロードするとテキストが表示されます
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {isRunning
                ? "タイマーが進行中です"
                : "Play ボタンでタイマーを開始してください"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
