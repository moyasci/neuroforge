// Citation network builder for paper relationship visualization
import { fetchByDOI } from "./metadata";

export interface CitationNode {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  citationCount: number | null;
  depth: number; // 0 = root paper
}

export interface CitationEdge {
  source: string;
  target: string;
  type: "cites" | "cited_by";
}

export interface CitationNetwork {
  nodes: CitationNode[];
  edges: CitationEdge[];
}

export async function buildCitationNetwork(
  paperDOI: string,
  maxDepth: number = 1,
): Promise<CitationNetwork> {
  const nodes: Map<string, CitationNode> = new Map();
  const edges: CitationEdge[] = [];

  async function traverse(doi: string, depth: number) {
    if (depth > maxDepth || nodes.has(doi)) return;

    const metadata = await fetchByDOI(doi);
    if (!metadata) return;

    nodes.set(doi, {
      id: doi,
      title: metadata.title,
      authors: metadata.authors,
      year: metadata.year,
      citationCount: metadata.citationCount,
      depth,
    });

    // Add references (papers this paper cites)
    for (const ref of metadata.references.slice(0, 10)) {
      if (ref.paperId) {
        edges.push({
          source: doi,
          target: ref.paperId,
          type: "cites",
        });
      }
    }

    // Add citations (papers that cite this paper)
    for (const cite of metadata.citations.slice(0, 10)) {
      if (cite.paperId) {
        edges.push({
          source: cite.paperId,
          target: doi,
          type: "cited_by",
        });
      }
    }
  }

  await traverse(paperDOI, 0);

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}
