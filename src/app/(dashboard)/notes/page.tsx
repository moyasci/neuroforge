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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, StickyNote, Calendar, Trash2 } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getNotes, deleteNote, type Note } from "@/lib/notes/actions";
import { NOTE_TYPES, type NoteType } from "@/types";

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  summary: "要約",
  concept: "概念",
  reflection: "考察",
  critique: "批評",
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}日前`;
  return d.toLocaleDateString("ja-JP");
}

export default function NotesPage() {
  const { isReady } = useDatabaseStatus();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const loadNotes = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const result = await getNotes(db);
      setNotes(result);
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }, [isReady]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      await deleteNote(db, noteId);
      await loadNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const filteredNotes =
    filterType === "all"
      ? notes
      : notes.filter((n) => n.noteType === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ノート</h2>
          <p className="text-muted-foreground">
            論文メモとフェイマン・ノート
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="フィルタ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {NOTE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {NOTE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/notes/new">
              <Plus className="mr-2 h-4 w-4" />
              新規ノート
            </Link>
          </Button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <StickyNote className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {filterType === "all"
              ? "ノートがありません"
              : `${NOTE_TYPE_LABELS[filterType as NoteType]}ノートがありません`}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/notes/new">
              <Plus className="mr-2 h-4 w-4" />
              新規ノートを作成
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="transition-colors hover:border-primary/50 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base">
                      {note.title}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {NOTE_TYPE_LABELS[note.noteType as NoteType]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={(e) => handleDelete(e, note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {note.content
                      ? note.content.replace(/<[^>]*>/g, "").slice(0, 120)
                      : "内容なし"}
                  </p>
                  <div className="mt-3 flex items-center justify-end">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(note.updatedAt)}
                    </span>
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
