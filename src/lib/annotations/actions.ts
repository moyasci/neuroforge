import { eq, and, desc } from "drizzle-orm";
import { annotations } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";
import type { AnnotationColor } from "@/types";

export type Annotation = typeof annotations.$inferSelect;
export type NewAnnotation = typeof annotations.$inferInsert;

export interface AnnotationPosition {
  pageNumber: number;
  rects: { x: number; y: number; width: number; height: number }[];
}

export async function getAnnotations(
  db: Database,
  paperId: string,
): Promise<Annotation[]> {
  return db
    .select()
    .from(annotations)
    .where(
      and(
        eq(annotations.paperId, paperId),
        eq(annotations.userId, LOCAL_USER_ID),
      ),
    )
    .orderBy(desc(annotations.createdAt));
}

export async function createAnnotation(
  db: Database,
  data: {
    paperId: string;
    color: AnnotationColor;
    text?: string;
    comment?: string;
    section?: string;
    position?: AnnotationPosition;
  },
): Promise<Annotation> {
  const results = await db
    .insert(annotations)
    .values({
      userId: LOCAL_USER_ID,
      paperId: data.paperId,
      color: data.color,
      text: data.text ?? null,
      comment: data.comment ?? null,
      section: data.section ?? null,
      position: data.position ?? null,
    })
    .returning();
  return results[0];
}

export async function updateAnnotation(
  db: Database,
  id: string,
  data: { comment?: string; color?: AnnotationColor },
): Promise<Annotation | undefined> {
  const results = await db
    .update(annotations)
    .set(data)
    .where(eq(annotations.id, id))
    .returning();
  return results[0];
}

export async function deleteAnnotation(
  db: Database,
  id: string,
): Promise<void> {
  await db.delete(annotations).where(eq(annotations.id, id));
}
