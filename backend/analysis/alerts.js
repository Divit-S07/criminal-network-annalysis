// analysis/alerts.js
// Explainable alert generation from graph analytics + evidence.
import crypto from 'node:crypto';

function alertId(prefix) {
  return `ALT-${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// Generate explainable alerts. All language is investigative-lead framing.
export function generateAlerts({ nodes, edges, analytics, caseId }) {
  const alerts = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // 1. Potential Cross-Network Connector (high betweenness / multi-case).
  for (const c of analytics.connectors.slice(0, 8)) {
    const ent = nodeById.get(c.id);
    if (!ent) continue;
    alerts.push({
      id: alertId('CNC'),
      type: 'Potential Cross-Network Connector',
      entityLabel: ent.label,
      entityType: ent.type,
      reason: `${ent.label} appears to bridge multiple parts of the network (centrality ${c.betweenness}, degree ${c.degree}). This is a potential cross-network connector requiring review.`,
      details: [
        `Degree centrality: ${c.degree}`,
        `Betweenness centrality: ${c.betweenness}`,
        ent.cases?.length > 1 ? `Appears in ${ent.cases.length} cases` : 'Single-case presence',
      ],
      confidence: Math.min(90, 50 + Math.round(c.betweenness * 200)),
      evidenceCount: c.degree,
    });
  }

  // 2. Multi-Source Relationship (same pair backed by >1 source).
  const pairSources = new Map();
  for (const e of edges) {
    const key = [e.source, e.target].sort().join('::');
    const src = e.evidence?.sourceType || 'unknown';
    if (!pairSources.has(key)) pairSources.set(key, { edge: e, sources: new Set() });
    pairSources.get(key).sources.add(src);
  }
  for (const { edge, sources } of pairSources.values()) {
    if (sources.size >= 2) {
      const ent = nodeById.get(edge.source);
      alerts.push({
        id: alertId('MSR'),
        type: 'Multi-Source Relationship',
        entityLabel: ent?.label || edge.source,
        entityType: ent?.type || 'ENTITY',
        reason: `The ${edge.type} link between ${edge.source} and ${edge.target} is supported by ${sources.size} independent sources (${[...sources].join(', ')}).`,
        details: [`Sources: ${[...sources].join(', ')}`, `Confidence: ${edge.confidence}%`],
        confidence: Math.min(95, 60 + sources.size * 10),
        evidenceCount: sources.size,
      });
    }
  }

  // 3. High Network Connectivity.
  const degree = new Map();
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) || 0) + 1);
    degree.set(e.target, (degree.get(e.target) || 0) + 1);
  }
  for (const [id, deg] of degree) {
    if (deg >= 8) {
      const ent = nodeById.get(id);
      if (!ent) continue;
      alerts.push({
        id: alertId('HNC'),
        type: 'High Network Connectivity',
        entityLabel: ent.label,
        entityType: ent.type,
        reason: `${ent.label} has ${deg} observed connections, notably higher than typical entities in this network.`,
        details: [`${deg} direct relationships`, 'Pattern warrants review'],
        confidence: Math.min(85, 45 + deg * 3),
        evidenceCount: deg,
      });
    }
  }

  // 4. Unusual Temporal Pattern (many events in a short window).
  const byDay = new Map();
  for (const e of edges) {
    if (!e.timestamp) continue;
    const day = String(e.timestamp).slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }
  for (const [day, count] of byDay) {
    if (count >= 10) {
      alerts.push({
        id: alertId('UTP'),
        type: 'Unusual Temporal Pattern',
        entityLabel: 'Network',
        entityType: 'EVENT',
        reason: `${count} relationships are timestamped on ${day}, an unusual concentration in this dataset.`,
        details: [`${count} events on ${day}`, 'Verify source records for this date'],
        confidence: Math.min(80, 40 + count),
        evidenceCount: count,
      });
    }
  }

  // Attach case + neutral labels.
  return alerts.map((a) => ({
    ...a,
    caseId: caseId || null,
    label: 'Investigative Lead',
    status: 'NEW',
  }));
}
