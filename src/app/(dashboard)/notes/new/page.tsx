"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { createNote } from "@/lib/notes/actions";
import { getPapers, type Paper } from "@/lib/papers/actions";
import { NOTE_TYPES, type NoteType } from "@/types";

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  summary: "要約",
  concept: "概念",
  reflection: "考察",
  critique: "批評",
};

export default function NewNotePage() {
  const router = useRouter();
  const { isReady } = useDatabaseStatus();
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("summary");
  const [paperId, setPaperId] = useState<string>("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      try {
        const db = (await import("@/db/pglite")).getDatabase();
        if (!db) return;
        const result = await getPapers(db);
        setPapers(result);
      } catch (err) {
        console.error("Failed to load papers:", err);
      }
    })();
  }, [isReady]);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !isReady) return;
    setCreating(true);
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const note = await createNote(db, {
        title: title.trim(),
        noteType,
        paperId: paperId || undefined,
      });
      router.push(`/notes/${note.id}`);
    } catch (err) {
      console.error("Failed to create note:", err);
      setCreating(false);
    }
  }, [title, noteType, paperId, isReady, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold tracking-tight">新規ノート</h2>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>ノート作成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ノートのタイトルを入力..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>ノートタイプ</Label>
            <Select
              value={noteType}
              onValueChange={(v) => setNoteType(v as NoteType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {NOTE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>関連論文（任意）</Label>
            <Select value={paperId} onValueChange={setPaperId}>
              <SelectTrigger>
                <SelectValue placeholder="論文を選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし</SelectItem>
                {papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.id}>
                    {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!title.trim() || creating}
          >
            {creating ? (
              "作成中..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                ノートを作成
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
