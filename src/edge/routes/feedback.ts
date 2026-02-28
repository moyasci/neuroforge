import { Hono } from "hono";
import { buildSystemPrompt } from "@/lib/llm/feedback";
import { createFeedbackStream } from "@/lib/llm/client";
import type { PromptTechnique, ContextType } from "@/types";

const feedback = new Hono();

// POST /feedback - LLM feedback endpoint
// Accepts contextType, contextId, promptTechnique, message, and conversation history
// Requires x-anthropic-key header for API authentication
// Returns a streaming SSE response from Claude API
feedback.post("/", async (c) => {
  const apiKey = c.req.header("x-anthropic-key");
  if (!apiKey) {
    return c.json({ error: "Anthropic API key is required. Set it in Settings." }, 401);
  }

  const { contextType, contextId, promptTechnique, message, history } = await c.req.json<{
    contextType: ContextType;
    contextId?: string;
    promptTechnique: PromptTechnique;
    message: string;
    history?: Array<{ role: string; content: string }>;
  }>();

  if (!message || !promptTechnique) {
    return c.json({ error: "message and promptTechnique are required" }, 400);
  }

  const systemPrompt = buildSystemPrompt({
    technique: promptTechnique,
  });

  try {
    const stream = await createFeedbackStream(
      {
        contextType: contextType ?? "reading",
        contextId: contextId ?? "",
        promptTechnique,
        message,
      },
      systemPrompt,
      apiKey,
      history,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

export default feedback;
