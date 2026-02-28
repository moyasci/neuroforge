import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";

export interface ReadingPreferences {
  timerEnabled: boolean;
  focusMode: boolean;
  fontSize: string;
  defaultTemplate: string;
}

const DEFAULT_PREFERENCES: ReadingPreferences = {
  timerEnabled: true,
  focusMode: false,
  fontSize: "16",
  defaultTemplate: "default",
};

export async function getReadingPreferences(
  db: Database,
): Promise<ReadingPreferences> {
  const results = await db
    .select({ readingPreferences: users.readingPreferences })
    .from(users)
    .where(eq(users.id, LOCAL_USER_ID))
    .limit(1);

  const prefs = results[0]?.readingPreferences as ReadingPreferences | null;
  return prefs ?? DEFAULT_PREFERENCES;
}

export async function updateReadingPreferences(
  db: Database,
  prefs: Partial<ReadingPreferences>,
): Promise<ReadingPreferences> {
  const current = await getReadingPreferences(db);
  const updated = { ...current, ...prefs };

  await db
    .update(users)
    .set({ readingPreferences: updated })
    .where(eq(users.id, LOCAL_USER_ID));

  return updated;
}
