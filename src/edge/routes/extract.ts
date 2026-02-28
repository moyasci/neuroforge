import { Hono } from "hono";

const extract = new Hono();

// POST /extract - PDF extraction endpoint
// Accepts a file upload and extracts content
extract.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided or invalid file" }, 400);
  }

  // TODO: Validate file type (PDF only)
  // TODO: Parse PDF content using a PDF extraction library
  // TODO: Extract text, tables, and metadata
  // TODO: Optionally chunk content for embedding

  // Placeholder extraction result
  return c.json({
    filename: file.name,
    size: file.size,
    type: file.type,
    extractedText: "",
    metadata: {},
    message: "PDF extraction placeholder - implementation pending",
  });
});

export default extract;
