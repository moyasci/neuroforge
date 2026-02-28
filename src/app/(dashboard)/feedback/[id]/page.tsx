"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Bot, User, AlertCircle } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import {
  getFeedbackSession,
  addFeedbackMessage,
  type FeedbackSession,
  type FeedbackMessage,
} from "@/lib/feedback/actions";

const TECHNIQUE_LABELS: Record<string, string> = {
  socratic: "ソクラテス式",
  rsip: "RSIP",
  cad: "CAD",
  ccp: "CCP",
  general: "フリー対話",
};

const API_KEYS_STORAGE_KEY = "neuroforge_api_keys";

function getAnthropicKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) {
      const keys = JSON.parse(stored);
      return keys.anthropic || "";
    }
  } catch {
    // ignore
  }
  return "";
}

export default function FeedbackChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReady } = useDatabaseStatus();
  const [session, setSession] = useState<FeedbackSession | null>(null);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = getAnthropicKey();

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const s = await getFeedbackSession(db, id);
      if (s) {
        setSession(s);
        setMessages((s.messages ?? []) as FeedbackMessage[]);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || sending || !session) return;

    const userMessage: FeedbackMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setStreamingContent("");

    try {
      // Save user message to DB
      const db = (await import("@/db/pglite")).getDatabase();
      if (db) {
        await addFeedbackMessage(db, id, userMessage);
      }

      // Build conversation history for the API
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      // Call Claude API via edge route
      const response = await fetch("/api/edge/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anthropic-key": apiKey,
        },
        body: JSON.stringify({
          contextType: session.contextType,
          contextId: session.contextId,
          promptTechnique: session.promptTechnique,
          message: userMessage.content,
          history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            if (event.type === "content_block_delta" && event.delta?.text) {
              fullContent += event.delta.text;
              setStreamingContent(fullContent);
            }
          } catch {
            // skip non-JSON lines
          }
        }
      }

      // Save assistant message to DB
      if (fullContent) {
        const assistantMessage: FeedbackMessage = {
          role: "assistant",
          content: fullContent,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");

        if (db) {
          await addFeedbackMessage(db, id, assistantMessage);
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMessage: FeedbackMessage = {
        role: "assistant",
        content: `エラー: ${err instanceof Error ? err.message : "メッセージの送信に失敗しました"}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent("");
    } finally {
      setSending(false);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="flex h-[calc(100vh-7rem)] flex-col">
        <Skeleton className="h-16" />
        <div className="flex-1 py-4">
          <Skeleton className="h-full" />
        </div>
        <Skeleton className="h-12" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">セッションが見つかりません</p>
        <Button asChild className="mt-4">
          <Link href="/feedback">フィードバック一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/feedback">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-lg font-bold">
              {TECHNIQUE_LABELS[session.promptTechnique] ?? session.promptTechnique} セッション
            </h2>
            <p className="text-xs text-muted-foreground">
              {session.contextType} | {new Date(session.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {messages.length > 0 ? "進行中" : "新規"}
        </Badge>
      </div>

      {/* API Key Warning */}
      {!apiKey && (
        <div className="mx-auto mt-4 max-w-2xl rounded-md border border-yellow-500/50 bg-yellow-50 p-3 dark:bg-yellow-950/20">
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span>
              Anthropic API キーが未設定です。
              <Link href="/settings" className="underline ml-1">
                設定画面
              </Link>
              で設定してください。
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12" />
              <p className="mt-4">メッセージを送信して対話を開始しましょう</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role !== "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.role !== "user" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <Card
                className={`max-w-md ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {/* Streaming response */}
          {streamingContent && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="max-w-md">
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t pt-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            placeholder={apiKey ? "メッセージを入力..." : "API キーを設定してください"}
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!apiKey || sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!apiKey || !input.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
