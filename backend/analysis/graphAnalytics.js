// analysis/graphAnalytics.js
// Deterministic graph analytics: degree, betweenness approximation, community detection.

// Build adjacency map from edges.
function buildAdjacency(nodes, edges) {
  const adj = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const e of edges) {
    if (!adj.has(e.source) || !adj.has(e.target)) continue;
    adj.get(e.source).add(e.target);
    adj.get(e.target).add(e.source);
  }
  return adj;
}

// Degree centrality.
export function degreeCentrality(nodes, edges) {
  const degree = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of edges) {
    if (degree.has(e.source)) degree.set(e.source, degree.get(e.source) + 1);
    if (degree.has(e.target)) degree.set(e.target, degree.get(e.target) + 1);
  }
  return degree;
}

// BFS shortest path between two nodes. Returns array of ids or null.
export function shortestPath(nodes, edges, from, to) {
  const adj = buildAdjacency(nodes, edges);
  if (!adj.has(from) || !adj.has(to)) return null;
  const prev = new Map([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) {
      const path = [];
      let node = to;
      while (node !== null) {
        path.unshift(node);
        node = prev.get(node);
      }
      return path;
    }
    for (const nb of adj.get(cur) || []) {
      if (!prev.has(nb)) {
        prev.set(nb, cur);
        queue.push(nb);
      }
    }
  }
  return null;
}

// Brandes betweenness centrality (exact, fine for ≤ a few thousand nodes).
export function betweennessCentrality(nodes, edges) {
  const adj = buildAdjacency(nodes, edges);
  const bc = new Map(nodes.map((n) => [n.id, 0]));
  for (const s of nodes) {
    const stack = [];
    const preds = new Map(nodes.map((n) => [n.id, []]));
    const sigma = new Map(nodes.map((n) => [n.id, 0]));
    const dist = new Map(nodes.map((n) => [n.id, -1]));
    sigma.set(s.id, 1);
    dist.set(s.id, 0);
    const queue = [s.id];
    while (queue.length) {
      const v = queue.shift();
      stack.push(v);
      for (const w of adj.get(v) || []) {
        if (dist.get(w) < 0) {
          dist.set(w, dist.get(v) + 1);
          queue.push(w);
        }
        if (dist.get(w) === dist.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          preds.get(w).push(v);
        }
      }
    }
    const delta = new Map(nodes.map((n) => [n.id, 0]));
    while (stack.length) {
      const w = stack.pop();
      for (const v of preds.get(w) || []) {
        delta.set(v, delta.get(v) + (sigma.get(v) / (sigma.get(w) || 1)) * (1 + delta.get(w)));
      }
      if (w !== s.id) bc.set(w, bc.get(w) + delta.get(w));
    }
  }
  // Undirected normalization.
  const scale = nodes.length > 2 ? 2 / ((nodes.length - 1) * (nodes.length - 2)) : 1;
  for (const [k, v] of bc) bc.set(k, v * scale);
  return bc;
}

// Label-propagation community detection (undirected).
export function detectCommunities(nodes, edges, maxIterations = 20) {
  const adj = buildAdjacency(nodes, edges);
  const labels = new Map(nodes.map((n, i) => [n.id, i]));
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (const n of nodes) {
      const counts = new Map();
      for (const nb of adj.get(n.id) || []) {
        counts.set(labels.get(nb), (counts.get(labels.get(nb)) || 0) + 1);
      }
      if (counts.size === 0) continue;
      let bestLabel = labels.get(n.id);
      let bestCount = counts.get(bestLabel) || 0;
      for (const [label, count] of counts) {
        if (count > bestCount) {
          bestCount = count;
          bestLabel = label;
        }
      }
      if (bestLabel !== labels.get(n.id)) {
        labels.set(n.id, bestLabel);
        changed = true;
      }
    }
    if (!changed) break;
  }
  const groups = new Map();
  for (const [id, label] of labels) {
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(id);
  }
  return [...groups.values()].map((members, i) => ({ communityId: i, members }));
}

// Full analytics bundle for the network route.
export function computeGraphAnalytics(nodes, edges) {
  const degree = degreeCentrality(nodes, edges);
  const bc = nodes.length <= 800 ? betweennessCentrality(nodes, edges) : new Map(nodes.map((n) => [n.id, 0]));
  const communities = detectCommunities(nodes, edges);

  const relTypeMap = new Map();
  for (const e of edges) relTypeMap.set(e.type, (relTypeMap.get(e.type) || 0) + 1);

  const ranked = nodes
    .map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      degree: degree.get(n.id) || 0,
      betweenness: Number((bc.get(n.id) || 0).toFixed(4)),
    }))
    .sort((a, b) => b.betweenness - a.betweenness || b.degree - a.degree);

  // Connectors: top betweenness with cross-case presence or high degree.
  const connectors = ranked.filter((n) => n.betweenness > 0.02 || n.degree >= 5).slice(0, 20);

  const density = nodes.length > 1 ? (2 * edges.length) / (nodes.length * (nodes.length - 1)) : 0;
  const avgConfidence = edges.length ? Math.round(edges.reduce((a, e) => a + (e.confidence || 0), 0) / edges.length) : 0;

  return {
    relationshipsByType: [...relTypeMap.entries()].map(([name, value]) => ({ name, value })),
    topEntities: ranked.slice(0, 25),
    connectors,
    communities,
    density: Number(density.toFixed(4)),
    avgConfidence,
  };
}
