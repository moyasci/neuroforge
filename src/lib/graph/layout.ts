// Force-directed graph layout algorithm (Pure TypeScript)
// O(n^2) per iteration — suitable for <=200 nodes

export interface GraphNode {
  id: string;
  type: "paper" | "note" | "project";
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

const REPULSION = 5000;
const ATTRACTION = 0.01;
const DAMPING = 0.9;
const MIN_DISTANCE = 30;

/**
 * Compute a force-directed layout for the given nodes and edges.
 * Mutates node positions in place and returns the same array.
 */
export function computeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations = 80,
): GraphNode[] {
  if (nodes.length === 0) return nodes;

  // Initialize positions randomly if at origin
  for (const node of nodes) {
    if (node.x === 0 && node.y === 0) {
      node.x = Math.random() * width * 0.8 + width * 0.1;
      node.y = Math.random() * height * 0.8 + height * 0.1;
    }
    node.vx = 0;
    node.vy = 0;
  }

  // Build adjacency lookup
  const edgeMap = new Map<string, string[]>();
  for (const edge of edges) {
    if (!edgeMap.has(edge.source)) edgeMap.set(edge.source, []);
    if (!edgeMap.has(edge.target)) edgeMap.set(edge.target, []);
    edgeMap.get(edge.source)!.push(edge.target);
    edgeMap.get(edge.target)!.push(edge.source);
  }

  const nodeMap = new Map<string, GraphNode>();
  for (const node of nodes) nodeMap.set(node.id, node);

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsive forces between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_DISTANCE) dist = MIN_DISTANCE;

        const force = REPULSION / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attractive forces along edges
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;

      const force = ATTRACTION * dist;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // Center gravity to keep nodes from drifting
    const cx = width / 2;
    const cy = height / 2;
    for (const node of nodes) {
      node.vx += (cx - node.x) * 0.001;
      node.vy += (cy - node.y) * 0.001;
    }

    // Apply velocities with damping
    for (const node of nodes) {
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;

      // Clamp to bounds
      node.x = Math.max(40, Math.min(width - 40, node.x));
      node.y = Math.max(40, Math.min(height - 40, node.y));
    }
  }

  return nodes;
}
