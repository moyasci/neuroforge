import { eq, and, desc } from "drizzle-orm";
import { notes } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";
import type { NoteType } from "@/types";

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export async function getNotes(db: Database): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, LOCAL_USER_ID))
    .orderBy(desc(notes.updatedAt));
}

export async function getNotesByPaper(
  db: Database,
  paperId: string,
): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.paperId, paperId), eq(notes.userId, LOCAL_USER_ID)))
    .orderBy(desc(notes.updatedAt));
}

export async function getNote(
  db: Database,
  id: string,
): Promise<Note | undefined> {
  const results = await db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1);
  return results[0];
}

export async function createNote(
  db: Database,
  data: {
    title: string;
    noteType: NoteType;
    paperId?: string;
    content?: string;
    annotationIds?: string[];
  },
): Promise<Note> {
  const results = await db
    .insert(notes)
    .values({
      userId: LOCAL_USER_ID,
      title: data.title,
      noteType: data.noteType,
      paperId: data.paperId ?? null,
      content: data.content ?? null,
      annotationIds: data.annotationIds ?? null,
    })
    .returning();
  return results[0];
}

export async function updateNote(
  db: Database,
  id: string,
  data: {
    title?: string;
    content?: string;
    noteType?: NoteType;
  },
): Promise<Note | undefined> {
  const results = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();
  return results[0];
}

export async function deleteNote(db: Database, id: string): Promise<void> {
  await db.delete(notes).where(eq(notes.id, id));
}
