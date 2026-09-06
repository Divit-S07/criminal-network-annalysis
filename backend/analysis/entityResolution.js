// analysis/entityResolution.js
// Deterministic entity resolution: strong identifiers weigh more; name alone never merges.
import crypto from 'node:crypto';

const STRONG_WEIGHTS = { phone: 45, vehicle: 40, account: 40 };
const WEAK_WEIGHTS = { name: 12, location: 8 };
const MERGE_THRESHOLD = 55; // requires at least one strong identifier contribution

function sim(a, b) {
  if (!a || !b) return 0;
  const x = String(a).toLowerCase().trim();
  const y = String(b).toLowerCase().trim();
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.8;
  // Token overlap (Jaccard-lite)
  const xs = new Set(x.split(/\s+/));
  const ys = new Set(y.split(/\s+/));
  let inter = 0;
  for (const t of xs) if (ys.has(t)) inter++;
  const union = new Set([...xs, ...ys]).size || 1;
  return inter / union;
}

// Compare two entity candidates. Returns { score, matchedBy, requiresReview }.
export function compareEntities(a, b) {
  if (a.type !== b.type) return { score: 0, matchedBy: [], requiresReview: false };
  const matchedBy = [];
  let score = 0;

  for (const field of ['phone', 'vehicle', 'account']) {
    const av = a.properties?.[field];
    const bv = b.properties?.[field];
    if (av && bv && String(av).toLowerCase() === String(bv).toLowerCase()) {
      score += STRONG_WEIGHTS[field];
      matchedBy.push(field);
    }
  }
  // Name alone can never reach the merge threshold.
  if (a.label && b.label) {
    const ns = sim(a.label, b.label);
    if (ns >= 0.9) {
      score += WEAK_WEIGHTS.name;
      matchedBy.push('name');
    }
  }
  const aLoc = a.properties?.location || a.properties?.address;
  const bLoc = b.properties?.location || b.properties?.address;
  if (aLoc && bLoc && sim(aLoc, bLoc) >= 0.9) {
    score += WEAK_WEIGHTS.location;
    matchedBy.push('location');
  }

  return {
    score,
    matchedBy,
    requiresReview: score > 0 && score < MERGE_THRESHOLD,
  };
}

// Resolve a list of candidate entities into canonical entities.
// Uncertain matches are returned as mergeCandidates (never auto-merged).
export function resolveEntities(candidates) {
  const canonical = [];
  for (const cand of candidates) {
    let best = null;
    let bestScore = 0;
    let bestMatchedBy = [];
    for (const c of canonical) {
      const { score, matchedBy } = compareEntities(cand, c.entity);
      if (score > bestScore) {
        bestScore = score;
        best = c;
        bestMatchedBy = matchedBy;
      }
    }
    if (best && bestScore >= MERGE_THRESHOLD) {
      best.entity.sources = [...new Set([...(best.entity.sources || []), ...(cand.sources || [])])];
      best.entity.matchedBy = [...new Set([...(best.entity.matchedBy || []), ...bestMatchedBy])];
      best.entity.confidence = Math.max(best.entity.confidence, bestScore);
      for (const [k, v] of Object.entries(cand.properties || {})) {
        if (!best.entity.properties[k]) best.entity.properties[k] = v;
      }
      best.memberIds.push(cand.tempId);
    } else {
      canonical.push({
        entity: {
          tempId: cand.tempId,
          type: cand.type,
          label: cand.label,
          properties: { ...(cand.properties || {}) },
          sources: [...(cand.sources || [])],
          matchedBy: [],
          confidence: 100,
        },
        memberIds: [cand.tempId],
        mergeCandidates: best && bestScore > 0 ? [best.entity.tempId] : [],
      });
    }
  }
  return canonical;
}

export function stableEntityId(prefix, seed) {
  return `${prefix}-${crypto.createHash('sha1').update(seed).digest('hex').slice(0, 8).toUpperCase()}`;
}
