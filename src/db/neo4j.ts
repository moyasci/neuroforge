// Neo4j connection for knowledge graph (GraphRAG)
// All functions are noop when NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD are not set.

import neo4j, { type Driver } from "neo4j-driver";

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
}

let driver: Driver | null = null;

/** Returns true if all Neo4j environment variables are set. */
export function isConfigured(): boolean {
  return Boolean(
    process.env.NEO4J_URI &&
      process.env.NEO4J_USER &&
      process.env.NEO4J_PASSWORD,
  );
}

/** Get or create the singleton Neo4j driver. Returns null if not configured. */
export function getDriver(): Driver | null {
  if (!isConfigured()) return null;
  if (driver) return driver;

  driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
  );
  return driver;
}

/** Close the driver connection. */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/** Create or merge a Concept node. Noop if not configured. */
export async function createConcept(concept: {
  id: string;
  name: string;
  description: string;
  field?: string;
  tags?: string[];
}): Promise<void> {
  const d = getDriver();
  if (!d) return;

  const session = d.session();
  try {
    await session.run(
      `MERGE (c:Concept {id: $id})
       SET c.name = $name, c.description = $description, c.field = $field, c.tags = $tags`,
      {
        id: concept.id,
        name: concept.name,
        description: concept.description,
        field: concept.field ?? null,
        tags: concept.tags ?? [],
      },
    );
  } finally {
    await session.close();
  }
}

/** Create or merge a relation between two concepts. Noop if not configured. */
export async function createRelation(
  fromId: string,
  toId: string,
  type: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const d = getDriver();
  if (!d) return;

  const session = d.session();
  try {
    // Dynamic relationship type via APOC-free pattern
    await session.run(
      `MATCH (a:Concept {id: $fromId}), (b:Concept {id: $toId})
       MERGE (a)-[r:RELATES_TO {relType: $type}]->(b)
       SET r += $props`,
      {
        fromId,
        toId,
        type,
        props: properties ?? {},
      },
    );
  } finally {
    await session.close();
  }
}

/** Find concepts related to a given concept within maxHops. Returns empty array if not configured. */
export async function findRelatedConcepts(
  conceptId: string,
  maxHops: number = 2,
): Promise<Array<{ id: string; name: string; distance: number }>> {
  const d = getDriver();
  if (!d) return [];

  const session = d.session();
  try {
    const result = await session.run(
      `MATCH path = (start:Concept {id: $id})-[*1..${Math.min(maxHops, 5)}]-(related:Concept)
       WHERE related.id <> $id
       RETURN DISTINCT related.id AS id, related.name AS name, length(path) AS distance
       ORDER BY distance ASC
       LIMIT 50`,
      { id: conceptId },
    );

    return result.records.map((record) => ({
      id: record.get("id") as string,
      name: record.get("name") as string,
      distance: neo4j.integer.toNumber(record.get("distance")),
    }));
  } finally {
    await session.close();
  }
}
