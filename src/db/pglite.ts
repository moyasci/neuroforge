import { PGlite } from "@electric-sql/pglite";

let client: PGlite | null = null;

/**
 * Initialize a PGLite instance with IndexedDB persistence.
 * This provides a local-first PostgreSQL-compatible database
 * that runs entirely in the browser.
 *
 * @returns The PGLite client instance
 */
export async function initPGLite(): Promise<PGlite> {
  if (client) {
    return client;
  }

  client = new PGlite("idb://neuroforge");

  return client;
}

export { client };
