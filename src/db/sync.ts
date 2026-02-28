// Supabase cloud sync via REST API
// Handles push-only synchronization from PGLite (local) to Supabase (cloud)
// No additional packages required — uses native fetch.

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

export type SyncTable = (typeof SYNC_TABLES)[number];

export interface SyncResult {
  table: SyncTable;
  pushed: number;
  errors: string[];
}

export function getSyncConfig(): SyncConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    enabled: Boolean(supabaseUrl && supabaseKey),
    supabaseUrl,
    supabaseKey,
  };
}

/**
 * Upsert rows to a single Supabase table via REST API.
 * Uses `Prefer: resolution=merge-duplicates` for conflict handling.
 */
async function upsertTable(
  config: SyncConfig,
  table: SyncTable,
  rows: Record<string, unknown>[],
): Promise<SyncResult> {
  const result: SyncResult = { table, pushed: 0, errors: [] };
  if (rows.length === 0) return result;

  try {
    const res = await fetch(`${config.supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseKey!,
        Authorization: `Bearer ${config.supabaseKey!}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const text = await res.text();
      result.errors.push(`${table}: HTTP ${res.status} — ${text}`);
    } else {
      result.pushed = rows.length;
    }
  } catch (err) {
    result.errors.push(
      `${table}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return result;
}

/**
 * Sync all local PGLite data to Supabase cloud.
 * Returns per-table results. Noop if not configured.
 */
export async function syncAllToCloud(): Promise<SyncResult[]> {
  const config = getSyncConfig();
  if (!config.enabled) {
    return SYNC_TABLES.map((table) => ({
      table,
      pushed: 0,
      errors: ["Supabase is not configured"],
    }));
  }

  const { getPGlite } = await import("@/db/pglite");
  const pg = getPGlite();
  if (!pg) {
    return SYNC_TABLES.map((table) => ({
      table,
      pushed: 0,
      errors: ["Local database not initialized"],
    }));
  }

  const results: SyncResult[] = [];

  for (const table of SYNC_TABLES) {
    try {
      const queryResult = await pg.query(`SELECT * FROM ${table}`);
      const rows = queryResult.rows as Record<string, unknown>[];
      const result = await upsertTable(config, table, rows);
      results.push(result);
    } catch (err) {
      results.push({
        table,
        pushed: 0,
        errors: [
          `Query error: ${err instanceof Error ? err.message : String(err)}`,
        ],
      });
    }
  }

  return results;
}
