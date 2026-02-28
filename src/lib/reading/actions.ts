import { eq, and, desc } from "drizzle-orm";
import { readingSessions } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";

export type ReadingSession = typeof readingSessions.$inferSelect;

export async function createReadingSession(
  db: Database,
  data: {
    paperId: string;
    phase: "pass_1" | "pass_2" | "pass_3" | "pass_4";
    focusMode?: boolean;
  },
): Promise<ReadingSession> {
  const results = await db
    .insert(readingSessions)
    .values({
      userId: LOCAL_USER_ID,
      paperId: data.paperId,
      phase: data.phase,
      focusMode: data.focusMode ?? false,
      durationSeconds: 0,
    })
    .returning();
  return results[0];
}

export async function updateReadingSessionDuration(
  db: Database,
  id: string,
  durationSeconds: number,
): Promise<void> {
  await db
    .update(readingSessions)
    .set({ durationSeconds })
    .where(eq(readingSessions.id, id));
}

export async function getReadingSessionsForPaper(
  db: Database,
  paperId: string,
): Promise<ReadingSession[]> {
  return db
    .select()
    .from(readingSessions)
    .where(
      and(
        eq(readingSessions.paperId, paperId),
        eq(readingSessions.userId, LOCAL_USER_ID),
      ),
    )
    .orderBy(desc(readingSessions.createdAt));
}

export async function getTotalReadingTime(
  db: Database,
  paperId: string,
): Promise<number> {
  const sessions = await getReadingSessionsForPaper(db, paperId);
  return sessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
}
