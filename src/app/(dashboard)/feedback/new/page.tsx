"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, FileText, StickyNote } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { createFeedbackSession } from "@/lib/feedback/actions";
import { getPapers, type Paper } from "@/lib/papers/actions";
import { getNotes, type Note } from "@/lib/notes/actions";
import type { ContextType, PromptTechnique } from "@/types";

const TECHNIQUES: Array<{ value: PromptTechnique; label: string; description: string }> = [
  { value: "socratic", label: "ソクラテス式", description: "質問を通じて理解を深める" },
  { value: "rsip", label: "RSIP", description: "段階的に推論を進める" },
  { value: "cad", label: "CAD", description: "批判的分析と議論" },
  { value: "ccp", label: "CCP", description: "確信度チェック" },
  { value: "general", label: "フリー対話", description: "自由な議論" },
];

export default function NewFeedbackPage() {
  const router = useRouter();
  const { isReady } = useDatabaseStatus();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contextType, setContextType] = useState<ContextType>("reading");
  const [contextId, setContextId] = useState<string | undefined>();
  const [technique, setTechnique] = useState<PromptTechnique>("socratic");
  const [showResources, setShowResources] = useState<"paper" | "note" | null>(null);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const [allPapers, allNotes] = await Promise.all([
        getPapers(db),
        getNotes(db),
      ]);
      setPapers(allPapers);
      setNotes(allNotes);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const session = await createFeedbackSession(db, {
        contextType,
        contextId,
        promptTechnique: technique,
      });
      router.push(`/feedback/${session.id}`);
    } catch (err) {
      console.error("Failed to create session:", err);
      setCreating(false);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feedback">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            新規フィードバックセッション
          </h2>
          <p className="text-muted-foreground">
            AI と対話して理解度をチェック
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            セッション設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>関連リソース（任意）</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant={showResources === "paper" ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => setShowResources(showResources === "paper" ? null : "paper")}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">論文を選択</span>
              </Button>
              <Button
                variant={showResources === "note" ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => setShowResources(showResources === "note" ? null : "note")}
              >
                <StickyNote className="h-5 w-5" />
                <span className="text-xs">ノートを選択</span>
              </Button>
            </div>
          </div>

          {/* Resource selection */}
          {showResources === "paper" && (
            <div className="space-y-2 max-h-48 overflow-auto rounded-md border p-2">
              {papers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">論文がありません</p>
              ) : (
                papers.map((p) => (
                  <Button
                    key={p.id}
                    variant={contextId === p.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      setContextId(p.id);
                      setContextType("reading");
                      setShowResources(null);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate text-sm">{p.title}</span>
                  </Button>
                ))
              )}
            </div>
          )}

          {showResources === "note" && (
            <div className="space-y-2 max-h-48 overflow-auto rounded-md border p-2">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">ノートがありません</p>
              ) : (
                notes.map((n) => (
                  <Button
                    key={n.id}
                    variant={contextId === n.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      setContextId(n.id);
                      setContextType("note");
                      setShowResources(null);
                    }}
                  >
                    <StickyNote className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate text-sm">{n.title}</span>
                  </Button>
                ))
              )}
            </div>
          )}

          {contextId && (
            <p className="text-xs text-muted-foreground">
              選択済み: {contextType === "reading" ? "論文" : "ノート"}
              <Button
                variant="link"
                size="sm"
                className="ml-1 h-auto p-0 text-xs"
                onClick={() => setContextId(undefined)}
              >
                解除
              </Button>
            </p>
          )}

          <div className="space-y-2">
            <Label>フィードバックタイプ</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {TECHNIQUES.map((t) => (
                <Button
                  key={t.value}
                  variant={technique === t.value ? "default" : "outline"}
                  className="text-sm flex-col h-auto py-2"
                  onClick={() => setTechnique(t.value)}
                >
                  <span>{t.label}</span>
                  <span className="text-xs font-normal opacity-70">{t.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "作成中..." : "セッションを開始"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
