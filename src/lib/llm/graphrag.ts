// GraphRAG pipeline: text search → graph traversal → context construction

import type { GraphRAGContext } from "./client";
import { isConfigured, findRelatedConcepts } from "@/db/neo4j";

/** PGLite ILIKE fallback search for concepts/papers/notes. */
async function searchPGLite(
  query: string,
): Promise<{
  concepts: Array<{ name: string; description: string }>;
  papers: Array<{ title: string; abstract: string }>;
}> {
  try {
    const { getPGlite } = await import("@/db/pglite");
    const pg = getPGlite();
    if (!pg) return { concepts: [], papers: [] };

    const likePattern = `%${query}%`;

    // Search papers by title or abstract
    const paperResult = await pg.query<{
      title: string;
      abstract: string | null;
    }>(
      `SELECT title, abstract FROM papers
       WHERE title ILIKE $1 OR abstract ILIKE $1
       LIMIT 10`,
      [likePattern],
    );

    // Search notes as concept proxies
    const noteResult = await pg.query<{
      title: string;
      content: string | null;
    }>(
      `SELECT title, content FROM notes
       WHERE title ILIKE $1 OR content ILIKE $1
       LIMIT 10`,
      [likePattern],
    );

    return {
      concepts: noteResult.rows.map((r) => ({
        name: r.title,
        description: (r.content ?? "").slice(0, 200),
      })),
      papers: paperResult.rows.map((r) => ({
        title: r.title,
        abstract: r.abstract ?? "",
      })),
    };
  } catch {
    return { concepts: [], papers: [] };
  }
}

/**
 * Build a GraphRAG context for LLM prompting.
 * Pipeline: OpenAI embedding (optional) → PGLite text search → Neo4j graph traversal (if configured).
 */
export async function buildGraphRAGContext(
  query: string,
  options?: {
    maxConcepts?: number;
    maxHops?: number;
    includeRelatedPapers?: boolean;
  },
): Promise<GraphRAGContext> {
  const maxHops = options?.maxHops ?? 2;

  // 1. PGLite fallback text search
  const pgResults = await searchPGLite(query);

  const concepts: GraphRAGContext["concepts"] = pgResults.concepts.map(
    (c) => ({ name: c.name, description: c.description }),
  );
  const relatedPapers: GraphRAGContext["relatedPapers"] = pgResults.papers.map(
    (p) => ({ title: p.title, abstract: p.abstract }),
  );
  const relations: GraphRAGContext["relations"] = [];

  // 2. Neo4j graph exploration (if configured)
  if (isConfigured() && concepts.length > 0) {
    try {
      // Use the first concept as a starting point for graph traversal
      for (const concept of concepts.slice(0, 3)) {
        const related = await findRelatedConcepts(concept.name, maxHops);
        for (const r of related) {
          relations.push({
            from: concept.name,
            to: r.name,
            type: "RELATED_TO",
          });
          // Add discovered concepts if not already present
          if (!concepts.find((c) => c.name === r.name)) {
            concepts.push({ name: r.name, description: "" });
          }
        }
      }
    } catch (err) {
      console.error("[GraphRAG] Neo4j traversal error:", err);
    }
  }

  return { concepts, relations, relatedPapers };
}

/**
 * Search across the knowledge base using GraphRAG pipeline.
 */
export async function searchGraphRAG(
  query: string,
  filters?: {
    fields?: string[];
    noteTypes?: string[];
    dateRange?: { from: string; to: string };
  },
): Promise<
  Array<{
    type: "concept" | "paper" | "note";
    id: string;
    title: string;
    excerpt: string;
    relevance: number;
    connections: Array<{ type: string; target: string }>;
  }>
> {
  const results: Array<{
    type: "concept" | "paper" | "note";
    id: string;
    title: string;
    excerpt: string;
    relevance: number;
    connections: Array<{ type: string; target: string }>;
  }> = [];

  try {
    const { getPGlite } = await import("@/db/pglite");
    const pg = getPGlite();
    if (!pg) return results;

    const likePattern = `%${query}%`;

    // Search papers
    const paperRows = await pg.query<{
      id: string;
      title: string;
      abstract: string | null;
      field: string | null;
    }>(
      `SELECT id, title, abstract, field FROM papers
       WHERE title ILIKE $1 OR abstract ILIKE $1 OR extracted_text ILIKE $1
       LIMIT 20`,
      [likePattern],
    );

    for (const row of paperRows.rows) {
      if (filters?.fields && row.field && !filters.fields.includes(row.field))
        continue;
      results.push({
        type: "paper",
        id: row.id,
        title: row.title,
        excerpt: (row.abstract ?? "").slice(0, 200),
        relevance: 0.8,
        connections: [],
      });
    }

    // Search notes
    const noteRows = await pg.query<{
      id: string;
      title: string;
      content: string | null;
      note_type: string;
    }>(
      `SELECT id, title, content, note_type FROM notes
       WHERE title ILIKE $1 OR content ILIKE $1
       LIMIT 20`,
      [likePattern],
    );

    for (const row of noteRows.rows) {
      if (
        filters?.noteTypes &&
        !filters.noteTypes.includes(row.note_type)
      )
        continue;
      results.push({
        type: "note",
        id: row.id,
        title: row.title,
        excerpt: (row.content ?? "").slice(0, 200),
        relevance: 0.7,
        connections: [],
      });
    }

    // Enrich with Neo4j connections if configured
    if (isConfigured()) {
      for (const result of results.slice(0, 5)) {
        try {
          const related = await findRelatedConcepts(result.id, 1);
          result.connections = related.map((r) => ({
            type: "RELATED_TO",
            target: r.name,
          }));
        } catch {
          // Neo4j query failed for this item, skip
        }
      }
    }
  } catch (err) {
    console.error("[GraphRAG] Search error:", err);
  }

  return results;
}
