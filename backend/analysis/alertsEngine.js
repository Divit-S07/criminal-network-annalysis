// analysis/alertsEngine.js — explainable alerts (investigative leads, never verdicts).
export function generateAlerts(nodes, edges, analytics) {
  const alerts = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // 1. Potential Cross-Network Connectors
  for (const id of analytics.connectorCandidates || []) {
    const n = byId.get(id);
    if (!n) continue;
    const relCount = edges.filter((e) => e.source === id || e.target === id).length;
    alerts.push({
      type: 'Potential Cross-Network Connector',
      entityId: n._id || id,
      entityLabel: n.label,
      entityType: n.type,
      reason: `${n.label} appears in ${n.cases.length} investigation case(s) and connects entities across distinct parts of the network. This is a Potential Cross-Network Connector and an Investigative Lead only.`,
      details: [
        `Appears in ${n.cases.length} case(s)`,
        `${relCount} observed/inferred relationships`,
        'Connects multiple network communities',
      ],
      confidence: Math.min(92, 60 + n.cases.length * 8),
      evidenceCount: relCount,
      caseId: n.cases?.[0] || null,
    });
  }

  // 2. High Network Connectivity
  for (const t of (analytics.topCentral || []).slice(0, 5)) {
    const n = byId.get(t.id);
    if (!n || (analytics.connectorCandidates || []).includes(t.id)) continue;
    if (t.degree < 5) continue;
    const relCount = edges.filter((e) => e.source === t.id || e.target === t.id).length;
    alerts.push({
      type: 'High Network Connectivity',
      entityId: n._id || t.id,
      entityLabel: n.label,
      entityType: n.type,
      reason: `${n.label} shows unusually high connectivity (${t.degree} direct links) within the uploaded dataset.`,
      details: [`Degree ${t.degree}`, `Centrality score ${t.score}`],
      confidence: Math.min(88, 55 + t.degree * 4),
      evidenceCount: relCount,
      caseId: n.cases?.[0] || null,
    });
  }

  // 3. Multi-Source Relationships
  const multiSource = edges.filter((e) => e.status === 'observed' && (e.confidence || 0) >= 90).slice(0, 20);
  for (const e of multiSource) {
    const src = byId.get(e.source);
    const tgt = byId.get(e.target);
    if (!src || !tgt) continue;
    alerts.push({
      type: 'Multi-Source Relationship',
      entityId: src._id || e.source,
      entityLabel: src.label,
      entityType: src.type,
      reason: `High-confidence ${e.type} relationship between ${src.label} and ${tgt.label} observed directly in the source records (${e.confidence}% confidence).`,
      details: [`Type: ${e.type}`, 'Directly present in source data'],
      confidence: e.confidence,
      evidenceCount: 1,
      caseId: src.cases?.[0] || null,
    });
  }

  // 4. Unusual Temporal Pattern: burst of events on the same date for one entity
  const byEntityDate = new Map();
  edges.forEach((e) => {
    if (!e.timestamp) return;
    const day = String(e.timestamp).slice(0, 10);
    for (const id of [e.source, e.target]) {
      const key = `${id}|${day}`;
      byEntityDate.set(key, (byEntityDate.get(key) || 0) + 1);
    }
  });
  for (const [key, count] of byEntityDate.entries()) {
    if (count < 4) continue;
    const [id] = key.split('|');
    const n = byId.get(id);
    if (!n) continue;
    alerts.push({
      type: 'Unusual Temporal Pattern',
      entityId: n._id || id,
      entityLabel: n.label,
      entityType: n.type,
      reason: `${n.label} was involved in ${count} relationships recorded on the same date — a coordinated activity pattern worth reviewing.`,
      details: [`${count} events on one date`],
      confidence: Math.min(80, 50 + count * 5),
      evidenceCount: count,
      caseId: n.cases?.[0] || null,
    });
  }

  return alerts;
}
