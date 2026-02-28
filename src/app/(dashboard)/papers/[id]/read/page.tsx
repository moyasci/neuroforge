"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getPaper, updatePaperPhase, type Paper } from "@/lib/papers/actions";
import type { ReadingPhase } from "@/types";

interface PassConfig {
  key: string;
  phase: ReadingPhase;
  label: string;
  target: string;
  purpose: string;
  tasks: string[];
}

const PASSES: PassConfig[] = [
  {
    key: "overview",
    phase: "pass_1_overview",
    label: "Pass 1: 概観",
    target: "タイトル、要旨、見出し",
    purpose: "全体像と関連性の判断",
    tasks: [
      "タイトルと著者を確認する",
      "アブストラクトを読む",
      "セクション見出しを確認する",
      "図表のキャプションを流し読みする",
      "結論を流し読みする",
      "参考文献リストを確認する",
    ],
  },
  {
    key: "conclusion",
    phase: "pass_2_conclusion",
    label: "Pass 2: 結論確認",
    target: "結論、考察の要約",
    purpose: "主要発見と主張の妥当性評価",
    tasks: [
      "結論セクションを精読する",
      "主要な発見を3つ以内でまとめる",
      "著者の主張の妥当性を評価する",
      "考察セクションの要約を理解する",
      "今後の課題として挙げられている点を確認する",
    ],
  },
  {
    key: "data",
    phase: "pass_3_data",
    label: "Pass 3: データ解析",
    target: "図、表、キャプション",
    purpose: "データの直接理解",
    tasks: [
      "すべての図を詳細に確認する",
      "すべての表のデータを確認する",
      "キャプションの説明を読む",
      "実験手法を理解する",
      "統計的手法の妥当性を確認する",
      "結果がデータに裏付けられているか評価する",
    ],
  },
  {
    key: "deep",
    phase: "pass_4_deep",
    label: "Pass 4: 詳細精読",
    target: "序論、方法、結果",
    purpose: "知識ギャップと再現性確認",
    tasks: [
      "序論を精読し、背景・動機を理解する",
      "方法論の詳細を追う",
      "数式・アルゴリズムの導出を確認する",
      "前提条件・仮定を整理する",
      "限界点を特定する",
      "自分の言葉で論文を要約する",
    ],
  },
];

const PHASE_ORDER: ReadingPhase[] = [
  "not_started",
  "pass_1_overview",
  "pass_2_conclusion",
  "pass_3_data",
  "pass_4_deep",
  "completed",
];

function phaseIndex(phase: ReadingPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

export default function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReady } = useDatabaseStatus();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [completedTasks, setCompletedTasks] = useState<
    Record<string, boolean[]>
  >({});
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);

  // Initialize completed tasks tracking
  useEffect(() => {
    const initial: Record<string, boolean[]> = {};
    PASSES.forEach((p) => {
      initial[p.key] = new Array(p.tasks.length).fill(false);
    });
    setCompletedTasks(initial);
  }, []);

  const loadPaper = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const result = await getPaper(db, id);
      if (result) {
        setPaper(result);
        // Set active tab to current phase
        const currentPhaseIdx = phaseIndex(result.readingPhase);
        if (currentPhaseIdx >= 1 && currentPhaseIdx <= 4) {
          setActiveTab(PASSES[currentPhaseIdx - 1].key);
        }
      }
    } catch (err) {
      console.error("Failed to load paper:", err);
    }
  }, [id, isReady]);

  useEffect(() => {
    loadPaper();
  }, [loadPaper]);

  const toggleTask = (passKey: string, taskIndex: number) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev };
      updated[passKey] = [...(prev[passKey] ?? [])];
      updated[passKey][taskIndex] = !updated[passKey][taskIndex];
      return updated;
    });
  };

  const completePass = async (passIndex: number) => {
    if (!paper) return;
    setSaving(true);
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;

      const nextPhase =
        passIndex < 3
          ? PASSES[passIndex + 1].phase
          : ("completed" as ReadingPhase);

      const updated = await updatePaperPhase(db, paper.id, nextPhase);
      if (updated) {
        setPaper(updated);
        if (passIndex < 3) {
          setActiveTab(PASSES[passIndex + 1].key);
        }
      }
    } catch (err) {
      console.error("Failed to update phase:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || !paper) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const currentPhaseIdx = phaseIndex(paper.readingPhase);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/papers/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold tracking-tight truncate">
            4-Pass 読解
          </h2>
          <p className="text-sm text-muted-foreground truncate">
            {paper.title}
          </p>
        </div>
        <Badge
          variant={
            paper.readingPhase === "completed" ? "default" : "secondary"
          }
        >
          {paper.readingPhase === "completed"
            ? "読了"
            : paper.readingPhase === "not_started"
              ? "未開始"
              : `Pass ${currentPhaseIdx} 進行中`}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {PASSES.map((pass, i) => {
            const isCompleted = currentPhaseIdx > i + 1;
            const isCurrent = currentPhaseIdx === i + 1;
            return (
              <TabsTrigger
                key={pass.key}
                value={pass.key}
                className="relative"
              >
                {isCompleted && (
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                )}
                {isCurrent && (
                  <ChevronRight className="mr-1 h-3 w-3 text-primary" />
                )}
                <span className="truncate">{pass.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PASSES.map((pass, passIndex) => {
          const isCompleted = currentPhaseIdx > passIndex + 1;
          const isCurrent = currentPhaseIdx === passIndex + 1;
          const isLocked =
            currentPhaseIdx < passIndex + 1 &&
            paper.readingPhase !== "not_started";
          const tasks = completedTasks[pass.key] ?? [];
          const completedCount = tasks.filter(Boolean).length;

          return (
            <TabsContent key={pass.key} value={pass.key}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Reading Area */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      読解エリア
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paper.sections &&
                    Object.values(paper.sections).some(Boolean) ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {pass.key === "overview" && (
                          <div>
                            <h3>アブストラクト</h3>
                            <p>{paper.abstract ?? "アブストラクトなし"}</p>
                          </div>
                        )}
                        {pass.key === "conclusion" && (
                          <div>
                            <h3>結論</h3>
                            <p>
                              {paper.sections?.conclusion ??
                                "結論セクションが抽出されていません"}
                            </p>
                          </div>
                        )}
                        {pass.key === "data" && (
                          <div>
                            <h3>結果</h3>
                            <p>
                              {paper.sections?.results ??
                                "結果セクションが抽出されていません"}
                            </p>
                          </div>
                        )}
                        {pass.key === "deep" && (
                          <div>
                            {paper.sections?.intro && (
                              <>
                                <h3>序論</h3>
                                <p>{paper.sections.intro}</p>
                              </>
                            )}
                            {paper.sections?.methods && (
                              <>
                                <h3>方法</h3>
                                <p>{paper.sections.methods}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-center">
                          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 text-muted-foreground">
                            PDF ビューア / テキスト表示エリア
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            PDF をアップロードするとテキストが表示されます
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tasks Panel */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{pass.label}</CardTitle>
                      {isCompleted && (
                        <Badge variant="default" className="text-xs">
                          完了
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        ターゲット
                      </p>
                      <p className="text-sm">{pass.target}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        目的
                      </p>
                      <p className="text-sm">{pass.purpose}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>タスク進捗</span>
                        <span>
                          {completedCount}/{pass.tasks.length}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(completedCount / pass.tasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {pass.tasks.map((task, i) => (
                        <button
                          key={i}
                          onClick={() => toggleTask(pass.key, i)}
                          className="flex w-full items-start gap-3 rounded-md p-1.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          {tasks[i] ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span
                            className={`text-sm ${tasks[i] ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task}
                          </span>
                        </button>
                      ))}
                    </div>

                    {!isCompleted && (isCurrent || paper.readingPhase === "not_started") && (
                      <Button
                        className="mt-4 w-full"
                        onClick={() => completePass(passIndex)}
                        disabled={saving}
                      >
                        {saving ? "保存中..." : "このパスを完了にする"}
                      </Button>
                    )}

                    {isLocked && !isCompleted && (
                      <p className="text-xs text-center text-muted-foreground">
                        前のパスを完了してください
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
