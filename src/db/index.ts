// Database connection placeholder
// This module will be configured with PGLite for local-first persistence
// and optionally Drizzle ORM for type-safe queries.
//
// PGLite setup:
//   - Uses IndexedDB for browser-side persistence
//   - See ./pglite.ts for the PGLite initialization logic
//   - Drizzle ORM will wrap the PGLite instance for schema management
//
// For server-side usage (e.g. NextAuth adapter), this will need to be
// replaced with a proper PostgreSQL connection or Supabase client.

export const db = {} as any;
