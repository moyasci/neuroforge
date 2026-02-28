import { Hono } from "hono";

const extract = new Hono();

// POST /extract - Server-side PDF extraction endpoint
//
// Architecture note:
// Primary extraction is now handled client-side via pdfjs-dist
// (see src/lib/papers/pdf-extractor.ts).
// This endpoint is retained for future Docling (Python) integration,
// which provides higher-precision table/equation extraction.
// When Docling is deployed, the client can POST the PDF here
// and receive a DoclingExtractionResult response.
extract.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided or invalid file" }, 400);
  }

  if (file.type !== "application/pdf") {
    return c.json({ error: "Only PDF files are accepted" }, 400);
  }

  // Future: forward to Docling service for high-precision extraction
  return c.json({
    filename: file.name,
    size: file.size,
    type: file.type,
    extractedText: "",
    metadata: {},
    message:
      "Server-side extraction via Docling not yet configured. Use client-side extraction.",
  });
});

export default extract;
