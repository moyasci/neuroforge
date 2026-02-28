import { eq, desc } from "drizzle-orm";
import { feedbackSessions } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";
import type { ContextType, PromptTechnique } from "@/types";

export type FeedbackSession = typeof feedbackSessions.$inferSelect;

export interface FeedbackMessage {
  role: string;
  content: string;
  timestamp: string;
}

export async function getFeedbackSessions(
  db: Database,
): Promise<FeedbackSession[]> {
  return db
    .select()
    .from(feedbackSessions)
    .where(eq(feedbackSessions.userId, LOCAL_USER_ID))
    .orderBy(desc(feedbackSessions.createdAt));
}

export async function getFeedbackSession(
  db: Database,
  id: string,
): Promise<FeedbackSession | undefined> {
  const results = await db
    .select()
    .from(feedbackSessions)
    .where(eq(feedbackSessions.id, id))
    .limit(1);
  return results[0];
}

export async function createFeedbackSession(
  db: Database,
  data: {
    contextType: ContextType;
    contextId?: string;
    promptTechnique: PromptTechnique;
  },
): Promise<FeedbackSession> {
  const results = await db
    .insert(feedbackSessions)
    .values({
      userId: LOCAL_USER_ID,
      contextType: data.contextType,
      contextId: data.contextId ?? null,
      promptTechnique: data.promptTechnique,
      messages: [],
      biasWarnings: [],
    })
    .returning();
  return results[0];
}

export async function addFeedbackMessage(
  db: Database,
  sessionId: string,
  message: FeedbackMessage,
): Promise<FeedbackSession | undefined> {
  const session = await getFeedbackSession(db, sessionId);
  if (!session) return undefined;

  const currentMessages = (session.messages ?? []) as FeedbackMessage[];
  const updatedMessages = [...currentMessages, message];

  const results = await db
    .update(feedbackSessions)
    .set({ messages: updatedMessages })
    .where(eq(feedbackSessions.id, sessionId))
    .returning();
  return results[0];
}

export async function deleteFeedbackSession(
  db: Database,
  id: string,
): Promise<void> {
  await db.delete(feedbackSessions).where(eq(feedbackSessions.id, id));
}
