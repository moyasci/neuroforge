// Zero Sync Engine configuration
// Handles background synchronization between PGLite (local) and Supabase (cloud)

export interface SyncConfig {
  enabled: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

// Tables to sync between local and cloud
const SYNC_TABLES = [
  "papers",
  "annotations",
  "notes",
  "projects",
  "project_entries",
  "feedback_sessions",
  "reading_sessions",
] as const;

export function getSyncConfig(): SyncConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    enabled: Boolean(supabaseUrl && supabaseKey),
    supabaseUrl,
    supabaseKey,
  };
}

// Phase 1: Zero Sync Engine integration
// Will be implemented when Zero is configured
export async function initSync() {
  const config = getSyncConfig();
  if (!config.enabled) {
    console.log("[Sync] Cloud sync disabled - running in local-only mode");
    return;
  }

  console.log("[Sync] Initializing Zero Sync Engine...");
  console.log(`[Sync] Tables to sync: ${SYNC_TABLES.join(", ")}`);
  // TODO: Initialize Zero Sync Engine with PGLite ↔ Supabase
}
