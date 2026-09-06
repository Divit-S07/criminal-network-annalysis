// ai/gemini.js
// Gemini API integration — the ONLY external AI service used.
// Sends cleaned/structured data only. Validates strict JSON responses.
import axios from 'axios';
import { cfg } from '../config/index.js';
import { logger } from '../config/logger.js';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export function isGeminiConfigured() {
  return Boolean(cfg.gemini.apiKey && !cfg.gemini.apiKey.startsWith('replace') && cfg.gemini.apiKey !== 'YOUR_GEMINI_API_KEY_HERE');
}

function extractJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  if (start === -1) return null;
  const candidate = raw.slice(start);
  try {
    return JSON.parse(candidate);
  } catch {
    // Try trimming to the last closing bracket.
    const lastObj = candidate.lastIndexOf('}');
    const lastArr = candidate.lastIndexOf(']');
    const end = Math.max(lastObj, lastArr);
    if (end > 0) {
      try {
        return JSON.parse(candidate.slice(0, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callGemini(prompt, { temperature = 0.1, maxTokens = 4096 } = {}) {
  if (!isGeminiConfigured()) throw new Error('GEMINI_NOT_CONFIGURED');
  const model = cfg.gemini.model;
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${cfg.gemini.apiKey}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: maxTokens, responseMimeType: 'application/json' },
  };
  try {
    const res = await axios.post(url, body, { timeout: 60000 });
    const text = res.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    return text;
  } catch (err) {
    logger.warn('Gemini primary model failed, trying fallback', { error: err?.response?.data?.error?.message || err?.message });
    const fbUrl = `${GEMINI_BASE}/${cfg.gemini.fallbackModel}:generateContent?key=${cfg.gemini.apiKey}`;
    const res = await axios.post(fbUrl, body, { timeout: 60000 });
    return res.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  }
}

// ── Complex entity + relationship extraction ────────────────────────────
// Input: cleaned structured records. Output validated strict JSON or null.
export async function geminiExtractEntitiesRelationships({ caseLabel, records, knownEntities }) {
  const prompt = `You are assisting a law-enforcement investigation decision-support system.
Analyze the structured records below. Extract entities and relationships.

STRICT RULES:
- Return ONLY valid JSON, no commentary.
- Use exactly these entity types: PERSON, PHONE, VEHICLE, ACCOUNT, LOCATION, ORGANIZATION, EVENT.
- Use exactly these relationship types: CALLS, USES, OWNS, PAYS, MEETS, ASSOCIATED_WITH, APPEARS_IN, CONTACTS.
- Mark relationships "observed" only when directly present in records; "inferred" when derived by reasoning.
- Include confidence (0-100) and a short reason for every relationship.
- Never assert criminality. This is investigative support only.

KNOWN ENTITIES (already extracted deterministically — prefer linking to these):
${JSON.stringify(knownEntities).slice(0, 4000)}

RECORDS:
${JSON.stringify(records).slice(0, 12000)}

Return JSON schema:
{
  "entities": [{ "type": "...", "label": "...", "properties": {} }],
  "relationships": [{ "source": "...", "target": "...", "type": "...", "status": "observed|inferred", "confidence": 0, "reason": "..." }]
}`;

  try {
    const text = await callGemini(prompt);
    const parsed = extractJson(text);
    if (!parsed || !Array.isArray(parsed.entities) || !Array.isArray(parsed.relationships)) {
      logger.warn('Gemini returned malformed JSON; falling back to deterministic-only results');
      return null;
    }
    // Validate + sanitize strict shapes.
    const ENTITY_TYPES = new Set(['PERSON', 'PHONE', 'VEHICLE', 'ACCOUNT', 'LOCATION', 'ORGANIZATION', 'EVENT']);
    const REL_TYPES = new Set(['CALLS', 'USES', 'OWNS', 'PAYS', 'MEETS', 'ASSOCIATED_WITH', 'APPEARS_IN', 'CONTACTS']);
    const entities = parsed.entities
      .filter((e) => e && ENTITY_TYPES.has(String(e.type).toUpperCase()) && e.label)
      .map((e) => ({ type: String(e.type).toUpperCase(), label: String(e.label).slice(0, 120), properties: typeof e.properties === 'object' && e.properties ? e.properties : {} }));
    const relationships = parsed.relationships
      .filter((r) => r && r.source && r.target && REL_TYPES.has(String(r.type).toUpperCase()))
      .map((r) => ({
        source: String(r.source).slice(0, 120),
        target: String(r.target).slice(0, 120),
        type: String(r.type).toUpperCase(),
        status: String(r.status).toLowerCase() === 'inferred' ? 'inferred' : 'observed',
        confidence: Math.max(0, Math.min(100, Number(r.confidence) || 60)),
        reason: String(r.reason || '').slice(0, 300),
      }));
    return { entities, relationships };
  } catch (err) {
    if (err?.message === 'GEMINI_NOT_CONFIGURED') {
      logger.info('Gemini not configured — using deterministic extraction only');
    } else {
      logger.error('Gemini extraction failed', { error: err?.message });
    }
    return null;
  }
}

// ── Investigation summary ───────────────────────────────────────────────
export async function geminiInvestigationSummary({ caseLabel, stats, topEntities, alerts }) {
  const prompt = `Write a neutral investigation summary (max 200 words) for case "${caseLabel}".
Use only these facts. Never declare guilt or criminality; use "potential", "observed", "requires review".
FACTS: ${JSON.stringify({ stats, topEntities: topEntities.slice(0, 15), alerts: alerts.slice(0, 10) })}
Return JSON: { "summary": "..." }`;
  try {
    const text = await callGemini(prompt, { temperature: 0.3, maxTokens: 512 });
    const parsed = extractJson(text);
    if (parsed && typeof parsed.summary === 'string') return parsed.summary.slice(0, 1200);
    return null;
  } catch {
    return null;
  }
}
