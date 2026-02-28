"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Check } from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { getNote, updateNote, type Note } from "@/lib/notes/actions";
import { NOTE_TYPES, type NoteType } from "@/types";
import TiptapEditor from "@/components/editor/TiptapEditor";
import FeedbackPanel from "@/components/notes/FeedbackPanel";

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  summary: "要約",
  concept: "概念",
  reflection: "考察",
  critique: "批評",
};

export default function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReady } = useDatabaseStatus();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("summary");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle",
  );
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNote = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const result = await getNote(db, id);
      if (result) {
        setNote(result);
        setTitle(result.title);
        setContent(result.content ?? "");
        setNoteType(result.noteType as NoteType);
      }
    } catch (err) {
      console.error("Failed to load note:", err);
    }
  }, [id, isReady]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const saveNote = useCallback(
    async (data: { title?: string; content?: string; noteType?: NoteType }) => {
      if (!isReady) return;
      setSaveStatus("saving");
      try {
        const db = (await import("@/db/pglite")).getDatabase();
        if (!db) return;
        const updated = await updateNote(db, id, data);
        if (updated) setNote(updated);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Failed to save note:", err);
        setSaveStatus("idle");
      }
    },
    [id, isReady],
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      saveNote({ content: newContent });
    },
    [saveNote],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = setTimeout(() => {
        saveNote({ title: value });
      }, 500);
    },
    [saveNote],
  );

  const handleNoteTypeChange = useCallback(
    (value: string) => {
      setNoteType(value as NoteType);
      saveNote({ noteType: value as NoteType });
    },
    [saveNote],
  );

  if (!isReady || !note) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-96 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-bold border-none shadow-none px-0 focus-visible:ring-0"
              placeholder="ノートタイトル..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={noteType} onValueChange={handleNoteTypeChange}>
            <SelectTrigger className="w-24 h-8 text-xs">
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
          {saveStatus === "saving" && (
            <Badge variant="secondary" className="text-xs">
              <Save className="mr-1 h-3 w-3 animate-spin" />
              保存中
            </Badge>
          )}
          {saveStatus === "saved" && (
            <Badge variant="secondary" className="text-xs">
              <Check className="mr-1 h-3 w-3" />
              保存済み
            </Badge>
          )}
        </div>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          <TiptapEditor content={content} onChange={handleContentChange} />
        </div>

        {/* AI Feedback Panel */}
        <FeedbackPanel noteId={id} noteContent={content} />
      </div>
    </div>
  );
}
