import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  jsonb,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "@auth/core/adapters";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const sourceTypeEnum = pgEnum("source_type", [
  "pdf",
  "url",
  "doi",
  "manual",
]);

export const fieldEnum = pgEnum("field", [
  "neuroscience",
  "cell_biology",
  "psychology",
  "engineering",
  "ai",
  "interdisciplinary",
]);

export const readingPhaseEnum = pgEnum("reading_phase", [
  "not_started",
  "pass_1_overview",
  "pass_2_conclusion",
  "pass_3_data",
  "pass_4_deep",
  "completed",
]);

export const annotationColorEnum = pgEnum("annotation_color", [
  "red",
  "yellow",
  "green",
  "purple",
  "blue",
  "orange",
  "gray",
]);

export const noteTypeEnum = pgEnum("note_type", [
  "summary",
  "concept",
  "reflection",
  "critique",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "in_progress",
  "completed",
]);

export const projectEntryTypeEnum = pgEnum("project_entry_type", [
  "code",
  "note",
  "design",
  "simulation",
]);

export const contextTypeEnum = pgEnum("context_type", [
  "note",
  "project",
  "reading",
  "concept",
]);

export const promptTechniqueEnum = pgEnum("prompt_technique", [
  "socratic",
  "rsip",
  "cad",
  "ccp",
  "general",
]);

export const sessionPhaseEnum = pgEnum("session_phase", [
  "pass_1",
  "pass_2",
  "pass_3",
  "pass_4",
]);

// ─── Application Tables ─────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  avatarUrl: text("avatar_url"),
  readingPreferences: jsonb("reading_preferences"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const papers = pgTable("papers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 1000 }).notNull(),
  authors: jsonb("authors").$type<string[]>(),
  abstract: text("abstract"),
  doi: varchar("doi", { length: 255 }),
  url: text("url"),
  sourceType: sourceTypeEnum("source_type").notNull(),
  pdfStoragePath: text("pdf_storage_path"),
  extractedText: text("extracted_text"),
  sections: jsonb("sections").$type<{
    intro?: string;
    methods?: string;
    results?: string;
    discussion?: string;
    conclusion?: string;
  }>(),
  figures: jsonb("figures"),
  field: fieldEnum("field"),
  tags: jsonb("tags").$type<string[]>(),
  readingPhase: readingPhaseEnum("reading_phase")
    .notNull()
    .default("not_started"),
  readingEvaluation: jsonb("reading_evaluation"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const annotations = pgTable("annotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  paperId: uuid("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  color: annotationColorEnum("color").notNull(),
  text: text("text"),
  comment: text("comment"),
  section: varchar("section", { length: 255 }),
  position: jsonb("position"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paperId: uuid("paper_id").references(() => papers.id, {
    onDelete: "set null",
  }),
  annotationIds: jsonb("annotation_ids").$type<string[]>(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  noteType: noteTypeEnum("note_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("planning"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectEntries = pgTable("project_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: projectEntryTypeEnum("type").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  language: varchar("language", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const feedbackSessions = pgTable("feedback_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contextType: contextTypeEnum("context_type").notNull(),
  contextId: uuid("context_id"),
  promptTechnique: promptTechniqueEnum("prompt_technique").notNull(),
  messages: jsonb("messages").$type<
    { role: string; content: string; timestamp: string }[]
  >(),
  biasWarnings: jsonb("bias_warnings").$type<
    { type: string; description: string }[]
  >(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const readingSessions = pgTable("reading_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paperId: uuid("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  phase: sessionPhaseEnum("phase").notNull(),
  durationSeconds: integer("duration_seconds"),
  focusMode: boolean("focus_mode").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── NextAuth Tables (for @auth/drizzle-adapter) ────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .notNull()
      .$type<AdapterAccountType>(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compoundKey: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);
