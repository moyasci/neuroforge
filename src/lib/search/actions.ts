import { sql } from "drizzle-orm";
import { papers, notes, annotations } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";

export interface SearchResult {
  id: string;
  type: "paper" | "note" | "annotation";
  title: string;
  snippet: string;
  url: string;
}

export async function searchAll(
  db: Database,
  query: string,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const pattern = `%${query}%`;

  // Search papers (title, abstract)
  const paperResults = await db
    .select({
      id: papers.id,
      title: papers.title,
      abstract: papers.abstract,
    })
    .from(papers)
    .where(
      sql`${papers.userId} = ${LOCAL_USER_ID} AND (${papers.title} ILIKE ${pattern} OR ${papers.abstract} ILIKE ${pattern})`,
    );

  // Search notes (title, content)
  const noteResults = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
    })
    .from(notes)
    .where(
      sql`${notes.userId} = ${LOCAL_USER_ID} AND (${notes.title} ILIKE ${pattern} OR ${notes.content} ILIKE ${pattern})`,
    );

  // Search annotations (text, comment)
  const annotationResults = await db
    .select({
      id: annotations.id,
      text: annotations.text,
      comment: annotations.comment,
      paperId: annotations.paperId,
    })
    .from(annotations)
    .where(
      sql`${annotations.userId} = ${LOCAL_USER_ID} AND (${annotations.text} ILIKE ${pattern} OR ${annotations.comment} ILIKE ${pattern})`,
    );

  const results: SearchResult[] = [];

  for (const p of paperResults) {
    results.push({
      id: p.id,
      type: "paper",
      title: p.title,
      snippet: p.abstract?.slice(0, 150) ?? "",
      url: `/papers/${p.id}`,
    });
  }

  for (const n of noteResults) {
    results.push({
      id: n.id,
      type: "note",
      title: n.title,
      snippet: n.content?.slice(0, 150) ?? "",
      url: `/notes/${n.id}`,
    });
  }

  for (const a of annotationResults) {
    results.push({
      id: a.id,
      type: "annotation",
      title: a.text?.slice(0, 80) ?? "アノテーション",
      snippet: a.comment?.slice(0, 150) ?? a.text?.slice(0, 150) ?? "",
      url: `/papers/${a.paperId}`,
    });
  }

  return results;
}
