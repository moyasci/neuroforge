import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

let pgliteInstance: PGlite | null = null;
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export type Database = ReturnType<typeof drizzle<typeof schema>>;

const SCHEMA_SQL = `
-- Enums
DO $$ BEGIN
  CREATE TYPE source_type AS ENUM ('pdf', 'url', 'doi', 'manual');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE field AS ENUM ('neuroscience', 'cell_biology', 'psychology', 'engineering', 'ai', 'interdisciplinary');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE reading_phase AS ENUM ('not_started', 'pass_1_overview', 'pass_2_conclusion', 'pass_3_data', 'pass_4_deep', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE annotation_color AS ENUM ('red', 'yellow', 'green', 'purple', 'blue', 'orange', 'gray');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE note_type AS ENUM ('summary', 'concept', 'reflection', 'critique');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE project_entry_type AS ENUM ('code', 'note', 'design', 'simulation');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE context_type AS ENUM ('note', 'project', 'reading', 'concept');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE prompt_technique AS ENUM ('socratic', 'rsip', 'cad', 'ccp', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE session_phase AS ENUM ('pass_1', 'pass_2', 'pass_3', 'pass_4');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  "emailVerified" TIMESTAMP,
  image TEXT,
  avatar_url TEXT,
  reading_preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Papers
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(1000) NOT NULL,
  authors JSONB,
  abstract TEXT,
  doi VARCHAR(255),
  url TEXT,
  source_type source_type NOT NULL,
  pdf_storage_path TEXT,
  extracted_text TEXT,
  sections JSONB,
  figures JSONB,
  field field,
  tags JSONB,
  reading_phase reading_phase NOT NULL DEFAULT 'not_started',
  reading_evaluation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Annotations
CREATE TABLE IF NOT EXISTS annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  color annotation_color NOT NULL,
  text TEXT,
  comment TEXT,
  section VARCHAR(255),
  position JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  annotation_ids JSONB,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  note_type note_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project entries
CREATE TABLE IF NOT EXISTS project_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type project_entry_type NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  language VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback sessions
CREATE TABLE IF NOT EXISTS feedback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context_type context_type NOT NULL,
  context_id UUID,
  prompt_technique prompt_technique NOT NULL,
  messages JSONB,
  bias_warnings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reading sessions
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  phase session_phase NOT NULL,
  duration_seconds INTEGER,
  focus_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Ensure a default local user exists for local-first mode
const SEED_SQL = `
INSERT INTO users (id, email, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'local@neuroforge.local', 'Local User')
ON CONFLICT (email) DO NOTHING;
`;

export const LOCAL_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function initDatabase(): Promise<Database> {
  if (drizzleInstance) return drizzleInstance;

  pgliteInstance = new PGlite("idb://neuroforge");
  await pgliteInstance.waitReady;

  // Run schema migrations
  await pgliteInstance.exec(SCHEMA_SQL);
  await pgliteInstance.exec(SEED_SQL);

  drizzleInstance = drizzle(pgliteInstance, { schema });
  return drizzleInstance;
}

export function getDatabase(): Database | null {
  return drizzleInstance;
}

export function getPGlite(): PGlite | null {
  return pgliteInstance;
}
