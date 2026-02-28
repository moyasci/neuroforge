// Neo4j connection for knowledge graph (GraphRAG)
// Will be configured in Phase 4

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
}

function getConfig(): Neo4jConfig {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error(
      "Neo4j configuration is incomplete. Set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD.",
    );
  }

  return { uri, user, password };
}

// Cypher query helpers for knowledge graph operations

export async function createConcept(concept: {
  id: string;
  name: string;
  description: string;
  field?: string;
  tags?: string[];
}) {
  const _config = getConfig();
  // Phase 4: Execute Cypher query via neo4j-driver
  // CREATE (c:Concept {id: $id, name: $name, description: $description, ...})
  console.log(`[Neo4j] Creating concept: ${concept.name}`);
}

export async function createRelation(
  fromId: string,
  toId: string,
  type: string,
  properties?: Record<string, unknown>,
) {
  const _config = getConfig();
  // Phase 4: Execute Cypher query
  // MATCH (a:Concept {id: $fromId}), (b:Concept {id: $toId})
  // CREATE (a)-[r:TYPE {props}]->(b)
  console.log(`[Neo4j] Creating relation: ${fromId} -[${type}]-> ${toId}`, properties);
}

export async function findRelatedConcepts(
  conceptId: string,
  maxHops: number = 2,
): Promise<Array<{ id: string; name: string; distance: number }>> {
  const _config = getConfig();
  // Phase 4: Execute Cypher query
  // MATCH (start:Concept {id: $id})-[*1..maxHops]-(related:Concept)
  // RETURN related, length(path) as distance
  console.log(`[Neo4j] Finding related concepts for: ${conceptId}, maxHops: ${maxHops}`);
  return [];
}
