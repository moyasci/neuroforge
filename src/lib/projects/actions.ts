import { eq, desc, sql } from "drizzle-orm";
import { projects, projectEntries } from "@/db/schema";
import type { Database } from "@/db/pglite";
import { LOCAL_USER_ID } from "@/db/pglite";
import type { ProjectStatus } from "@/types";

export type Project = typeof projects.$inferSelect;
export type ProjectEntry = typeof projectEntries.$inferSelect;

export interface ProjectWithCount extends Project {
  entryCount: number;
}

export async function getProjects(
  db: Database,
): Promise<ProjectWithCount[]> {
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, LOCAL_USER_ID))
    .orderBy(desc(projects.updatedAt));

  const result: ProjectWithCount[] = [];
  for (const project of allProjects) {
    const entries = await db
      .select({ count: sql<number>`count(*)` })
      .from(projectEntries)
      .where(eq(projectEntries.projectId, project.id));
    result.push({ ...project, entryCount: Number(entries[0]?.count ?? 0) });
  }
  return result;
}

export async function getProject(
  db: Database,
  id: string,
): Promise<{ project: Project; entries: ProjectEntry[] } | undefined> {
  const results = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  const project = results[0];
  if (!project) return undefined;

  const entries = await db
    .select()
    .from(projectEntries)
    .where(eq(projectEntries.projectId, id))
    .orderBy(desc(projectEntries.createdAt));

  return { project, entries };
}

export async function createProject(
  db: Database,
  data: {
    title: string;
    description?: string;
    status?: ProjectStatus;
  },
): Promise<Project> {
  const results = await db
    .insert(projects)
    .values({
      userId: LOCAL_USER_ID,
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? "planning",
    })
    .returning();
  return results[0];
}

export async function updateProject(
  db: Database,
  id: string,
  data: { title?: string; description?: string; status?: ProjectStatus },
): Promise<Project | undefined> {
  const results = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return results[0];
}

export async function deleteProject(
  db: Database,
  id: string,
): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}

export async function createProjectEntry(
  db: Database,
  data: {
    projectId: string;
    type: "code" | "note" | "design" | "simulation";
    title: string;
    content?: string;
    language?: string;
  },
): Promise<ProjectEntry> {
  const results = await db
    .insert(projectEntries)
    .values({
      projectId: data.projectId,
      type: data.type,
      title: data.title,
      content: data.content ?? null,
      language: data.language ?? null,
    })
    .returning();

  // Update project's updatedAt
  await db
    .update(projects)
    .set({ updatedAt: new Date() })
    .where(eq(projects.id, data.projectId));

  return results[0];
}

export async function deleteProjectEntry(
  db: Database,
  id: string,
): Promise<void> {
  await db.delete(projectEntries).where(eq(projectEntries.id, id));
}
