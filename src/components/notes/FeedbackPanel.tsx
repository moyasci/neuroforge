"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { PROMPT_TECHNIQUES, type PromptTechnique } from "@/types";

const TECHNIQUE_LABELS: Record<PromptTechnique, string> = {
  socratic: "ソクラテス式",
  rsip: "RSIP (再帰的自己改善)",
  cad: "CAD (文脈分解)",
  ccp: "CCP (信頼度較正)",
  general: "一般",
};

interface FeedbackPanelProps {
  noteId: string;
  noteContent: string;
}

export default function FeedbackPanel({
  noteId,
  noteContent,
}: FeedbackPanelProps) {
  const [technique, setTechnique] = useState<PromptTechnique>("socratic");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const requestFeedback = useCallback(async () => {
    if (!noteContent.trim()) return;

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setFeedback("");

    try {
      const response = await fetch("/api/edge/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType: "note",
          contextId: noteId,
          promptTechnique: technique,
          message: `以下のノート内容についてフィードバックをください:\n\n${noteContent.replace(/<[^>]*>/g, "")}`,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("フィードバックの取得に失敗しました");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream not available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta") {
                setFeedback((prev) => prev + (parsed.delta?.text ?? ""));
              }
            } catch {
              // Non-JSON line, skip
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "フィードバックの取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }, [noteId, noteContent, technique]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4" />
          AI フィードバック
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Select
            value={technique}
            onValueChange={(v) => setTechnique(v as PromptTechnique)}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROMPT_TECHNIQUES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TECHNIQUE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={requestFeedback}
            disabled={loading || !noteContent.trim()}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {feedback ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm rounded-md border p-3 max-h-[calc(100vh-20rem)] overflow-auto whitespace-pre-wrap">
            {feedback}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center rounded-md border border-dashed">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">
              ノートを書いてからフィードバックを
              <br />
              リクエストできます
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
