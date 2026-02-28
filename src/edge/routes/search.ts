import { Hono } from "hono";
import { searchGraphRAG } from "@/lib/llm/graphrag";

const search = new Hono();

// POST /search - GraphRAG search endpoint
// Accepts a query string and optional filters
// Returns search results from the knowledge graph + PGLite text search
search.post("/", async (c) => {
  const body = await c.req.json<{
    query: string;
    filters?: {
      fields?: string[];
      noteTypes?: string[];
      dateRange?: { from: string; to: string };
    };
  }>();

  if (!body.query || typeof body.query !== "string") {
    return c.json({ error: "query is required" }, 400);
  }

  try {
    const results = await searchGraphRAG(body.query, body.filters);

    return c.json({
      query: body.query,
      filters: body.filters ?? {},
      results,
      totalCount: results.length,
    });
  } catch (err) {
    console.error("[Search] Error:", err);
    return c.json({
      query: body.query,
      filters: body.filters ?? {},
      results: [],
      totalCount: 0,
      error: "Search failed",
    }, 500);
  }
});

export default search;
