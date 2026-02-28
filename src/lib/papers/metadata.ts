// Semantic Scholar + CrossRef API integration for paper metadata

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  doi: string | null;
  url: string | null;
  year: number | null;
  venue: string | null;
  citationCount: number | null;
  references: Array<{ paperId: string; title: string }>;
  citations: Array<{ paperId: string; title: string }>;
}

const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1";

export async function fetchByDOI(doi: string): Promise<PaperMetadata | null> {
  try {
    const res = await fetch(
      `${SEMANTIC_SCHOLAR_API}/paper/DOI:${encodeURIComponent(doi)}?fields=title,authors,abstract,externalIds,url,year,venue,citationCount,references,citations`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return mapSemanticScholarResponse(data);
  } catch {
    return null;
  }
}

export async function fetchByTitle(
  title: string,
): Promise<PaperMetadata | null> {
  try {
    const res = await fetch(
      `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(title)}&limit=1&fields=title,authors,abstract,externalIds,url,year,venue,citationCount,references,citations`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return mapSemanticScholarResponse(data.data[0]);
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchByURL(url: string): Promise<PaperMetadata | null> {
  // Try to extract DOI from URL
  const doiMatch = url.match(/10\.\d{4,}\/[^\s]+/);
  if (doiMatch) {
    return fetchByDOI(doiMatch[0]);
  }

  // Try Semantic Scholar URL
  const s2Match = url.match(/semanticscholar\.org\/paper\/.*?([a-f0-9]{40})/);
  if (s2Match) {
    try {
      const res = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/${s2Match[1]}?fields=title,authors,abstract,externalIds,url,year,venue,citationCount,references,citations`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return mapSemanticScholarResponse(data);
    } catch {
      return null;
    }
  }

  // Try arXiv URL
  const arxivMatch = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+)/);
  if (arxivMatch) {
    try {
      const res = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/ARXIV:${arxivMatch[1]}?fields=title,authors,abstract,externalIds,url,year,venue,citationCount,references,citations`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return mapSemanticScholarResponse(data);
    } catch {
      return null;
    }
  }

  return null;
}

function mapSemanticScholarResponse(data: Record<string, unknown>): PaperMetadata {
  const authors = (data.authors as Array<{ name: string }>) ?? [];
  const refs = (data.references as Array<{ paperId: string; title: string }>) ?? [];
  const cites = (data.citations as Array<{ paperId: string; title: string }>) ?? [];
  const externalIds = (data.externalIds as Record<string, string>) ?? {};

  return {
    title: (data.title as string) ?? "",
    authors: authors.map((a) => a.name),
    abstract: (data.abstract as string) ?? "",
    doi: externalIds.DOI ?? null,
    url: (data.url as string) ?? null,
    year: (data.year as number) ?? null,
    venue: (data.venue as string) ?? null,
    citationCount: (data.citationCount as number) ?? null,
    references: refs
      .filter((r) => r.paperId && r.title)
      .slice(0, 50),
    citations: cites
      .filter((c) => c.paperId && c.title)
      .slice(0, 50),
  };
}
