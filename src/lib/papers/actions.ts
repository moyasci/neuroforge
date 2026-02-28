import { eq, desc } from "drizzle-orm";
import { papers } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";
import type { PaperField, ReadingPhase } from "@/types";

export type Paper = typeof papers.$inferSelect;
export type NewPaper = typeof papers.$inferInsert;

export async function getPapers(db: Database): Promise<Paper[]> {
  return db.select().from(papers).orderBy(desc(papers.createdAt));
}

export async function getPapersByField(
  db: Database,
  field: PaperField,
): Promise<Paper[]> {
  return db
    .select()
    .from(papers)
    .where(eq(papers.field, field))
    .orderBy(desc(papers.createdAt));
}

export async function getPaper(
  db: Database,
  id: string,
): Promise<Paper | undefined> {
  const results = await db
    .select()
    .from(papers)
    .where(eq(papers.id, id))
    .limit(1);
  return results[0];
}

export async function createPaper(
  db: Database,
  data: {
    title: string;
    authors?: string[];
    abstract?: string;
    doi?: string;
    url?: string;
    sourceType: "pdf" | "url" | "doi" | "manual";
    field?: PaperField;
    tags?: string[];
    extractedText?: string;
    sections?: {
      intro?: string;
      methods?: string;
      results?: string;
      discussion?: string;
      conclusion?: string;
    };
  },
): Promise<Paper> {
  const results = await db
    .insert(papers)
    .values({
      userId: LOCAL_USER_ID,
      title: data.title,
      authors: data.authors ?? [],
      abstract: data.abstract ?? null,
      doi: data.doi ?? null,
      url: data.url ?? null,
      sourceType: data.sourceType,
      field: data.field ?? null,
      tags: data.tags ?? [],
      extractedText: data.extractedText ?? null,
      sections: data.sections ?? null,
      readingPhase: "not_started",
    })
    .returning();
  return results[0];
}

export async function updatePaperPhase(
  db: Database,
  id: string,
  phase: ReadingPhase,
): Promise<Paper | undefined> {
  const results = await db
    .update(papers)
    .set({ readingPhase: phase, updatedAt: new Date() })
    .where(eq(papers.id, id))
    .returning();
  return results[0];
}

export async function updatePaper(
  db: Database,
  id: string,
  data: Partial<NewPaper>,
): Promise<Paper | undefined> {
  const results = await db
    .update(papers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(papers.id, id))
    .returning();
  return results[0];
}

export async function deletePaper(db: Database, id: string): Promise<void> {
  await db.delete(papers).where(eq(papers.id, id));
}
