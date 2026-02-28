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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MessageSquare, Calendar, Trash2 } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import {
  getFeedbackSessions,
  deleteFeedbackSession,
  type FeedbackSession,
  type FeedbackMessage,
} from "@/lib/feedback/actions";

const TECHNIQUE_LABELS: Record<string, string> = {
  socratic: "ソクラテス式",
  rsip: "RSIP",
  cad: "CAD",
  ccp: "CCP",
  general: "フリー",
};

export default function FeedbackPage() {
  const { isReady } = useDatabaseStatus();
  const [sessions, setSessions] = useState<FeedbackSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const all = await getFeedbackSessions(db);
      setSessions(all);
    } catch (err) {
      console.error("Failed to load feedback sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await deleteFeedbackSession(db, id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            フィードバック
          </h2>
          <p className="text-muted-foreground">
            AI との対話で理解度を確認・深化
          </p>
        </div>
        <Button asChild>
          <Link href="/feedback/new">
            <Plus className="mr-2 h-4 w-4" />
            新規セッション
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              フィードバックセッションがありません
            </p>
            <Button asChild className="mt-4">
              <Link href="/feedback/new">
                <Plus className="mr-2 h-4 w-4" />
                最初のセッションを作成
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => {
            const messages = (session.messages ?? []) as FeedbackMessage[];
            const messageCount = messages.length;
            return (
              <Link key={session.id} href={`/feedback/${session.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {session.contextType} - {TECHNIQUE_LABELS[session.promptTechnique] ?? session.promptTechnique}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleDelete(e, session.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {messageCount} メッセージ
                        </span>
                        <Badge variant={messageCount > 0 ? "secondary" : "outline"}>
                          {messageCount > 0 ? "進行中" : "新規"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
