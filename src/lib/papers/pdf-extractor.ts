// Client-side PDF text extraction using pdfjs-dist
// Extracts text, detects sections, and retrieves metadata

import * as pdfjs from "pdfjs-dist";
import type { DoclingExtractionResult } from "./docling";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// Section heading patterns for academic papers
const SECTION_PATTERNS: Array<{ key: string; pattern: RegExp }> = [
  {
    key: "introduction",
    pattern: /^(?:\d+\.?\s*)?introduction/i,
  },
  {
    key: "methods",
    pattern:
      /^(?:\d+\.?\s*)?(?:methods?|materials?\s*(?:and|&)\s*methods?|experimental\s*(?:methods?|procedures?|setup))/i,
  },
  {
    key: "results",
    pattern: /^(?:\d+\.?\s*)?results?/i,
  },
  {
    key: "discussion",
    pattern: /^(?:\d+\.?\s*)?discussion/i,
  },
  {
    key: "conclusion",
    pattern: /^(?:\d+\.?\s*)?(?:conclusions?|summary)/i,
  },
  {
    key: "references",
    pattern: /^(?:\d+\.?\s*)?references?/i,
  },
];

/**
 * Extract text content from a single PDF page, sorted by Y coordinate
 * and joined into lines.
 */
async function extractPageText(
  page: pdfjs.PDFPageProxy,
): Promise<string> {
  const content = await page.getTextContent();
  const items = content.items.filter(
    (item) => "str" in item && (item as { str: string }).str.length > 0,
  ) as Array<{ str: string; transform: number[] }>;

  if (items.length === 0) return "";

  // Sort by Y (descending = top to bottom), then X (left to right)
  // transform[5] = Y coordinate, transform[4] = X coordinate
  items.sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) > 2) return yDiff;
    return a.transform[4] - b.transform[4];
  });

  // Group into lines by Y proximity
  const lines: string[] = [];
  let currentLine = items[0].str;
  let currentY = items[0].transform[5];

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const y = item.transform[5];

    if (Math.abs(y - currentY) > 2) {
      // New line
      lines.push(currentLine.trim());
      currentLine = item.str;
      currentY = y;
    } else {
      // Same line — add space if needed
      currentLine += " " + item.str;
    }
  }
  lines.push(currentLine.trim());

  return lines.filter(Boolean).join("\n");
}

/**
 * Detect which section a line belongs to.
 * Returns the section key or null.
 */
function detectSection(line: string): string | null {
  const trimmed = line.trim();
  for (const { key, pattern } of SECTION_PATTERNS) {
    if (pattern.test(trimmed)) return key;
  }
  return null;
}

/**
 * Extract text from a PDF ArrayBuffer on the client side.
 * Uses pdfjs-dist for parsing — no external service required.
 */
export async function extractPDFClientSide(
  buffer: ArrayBuffer,
): Promise<DoclingExtractionResult> {
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  // --- Metadata ---
  const meta = await pdf.getMetadata();
  const info = meta?.info as Record<string, string> | undefined;
  const title = info?.Title || undefined;
  const authorRaw = info?.Author || undefined;
  const authors = authorRaw
    ? authorRaw.split(/[,;]/).map((a) => a.trim()).filter(Boolean)
    : undefined;

  // --- Page text extraction ---
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await extractPageText(page);
    pageTexts.push(text);
  }

  const fullText = pageTexts.join("\n\n");

  // --- Section detection ---
  const sections: Record<string, string> = {};
  const lines = fullText.split("\n");
  let currentSection: string | null = null;
  let sectionLines: string[] = [];

  const flushSection = () => {
    if (currentSection && sectionLines.length > 0) {
      sections[currentSection] = sectionLines.join("\n").trim();
    }
  };

  for (const line of lines) {
    const section = detectSection(line);
    if (section) {
      flushSection();
      currentSection = section;
      sectionLines = [];
    } else if (currentSection) {
      sectionLines.push(line);
    }
  }
  flushSection();

  // --- Abstract detection (heuristic: text between title and Introduction) ---
  let abstract: string | undefined;
  const introIndex = lines.findIndex((l) =>
    /^(?:\d+\.?\s*)?(?:introduction|abstract)/i.test(l.trim()),
  );
  if (introIndex > 0) {
    const abstractMatch = lines.findIndex((l) =>
      /^abstract/i.test(l.trim()),
    );
    if (abstractMatch >= 0) {
      const endIndex = lines.findIndex(
        (l, i) => i > abstractMatch && detectSection(l) !== null,
      );
      const end = endIndex > abstractMatch ? endIndex : abstractMatch + 10;
      abstract = lines
        .slice(abstractMatch + 1, end)
        .join(" ")
        .trim();
    }
  }

  return {
    markdown: fullText,
    sections: {
      introduction: sections.introduction,
      methods: sections.methods,
      results: sections.results,
      discussion: sections.discussion,
      conclusion: sections.conclusion,
      references: sections.references,
    },
    figures: [],
    tables: [],
    metadata: {
      title,
      authors,
      abstract,
      pageCount: pdf.numPages,
    },
  };
}
