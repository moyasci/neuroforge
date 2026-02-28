// Claude API client for LLM feedback
// Will be used via Hono Edge Functions for streaming responses

export interface FeedbackRequest {
  contextType: "note" | "project" | "reading" | "concept";
  contextId: string;
  promptTechnique: "socratic" | "rsip" | "cad" | "ccp" | "general";
  message: string;
  graphContext?: GraphRAGContext;
}

export interface GraphRAGContext {
  concepts: Array<{ name: string; description: string }>;
  relations: Array<{ from: string; to: string; type: string }>;
  relatedPapers: Array<{ title: string; abstract: string }>;
}

export interface FeedbackMessage {
  role: "user" | "assistant";
  content: string;
  confidenceLevel?: 1 | 2 | 3 | 4 | 5;
  biasWarnings?: Array<{ type: string; message: string }>;
}

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function createFeedbackStream(
  request: FeedbackRequest,
  systemPrompt: string,
  apiKey: string,
  history?: Array<{ role: string; content: string }>,
): Promise<ReadableStream> {
  // Build messages array from history + current message
  const messages: Array<{ role: string; content: string }> = [];

  if (history && history.length > 0) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: "user", content: request.message });

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  return response.body!;
}
