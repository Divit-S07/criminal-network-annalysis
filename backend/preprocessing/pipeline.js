// preprocessing/pipeline.js — deterministic local preprocessing before any AI.
// Stages: clean → normalize → validate → dedupe. Never deletes invalid data; marks issues.
import { cleanText, normalizePhone, normalizeVehicle, normalizeDate, normalizeTime, normalizeCurrency } from '../utils/normalize.js';

const PHONE_RE = /(\+?\d[\d\s\-().]{7,}\d)/g;
const VEHICLE_RE = /\b([A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4})\b/g;
const ACCOUNT_RE = /\b(\d{11,18})\b/g;
const DATE_RE = /\b(\d{4}-\d{2}-\d{2}|\d{2}[\/.\-]\d{2}[\/.\-]\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi;
const TIME_RE = /\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)\b/gi;
const CURRENCY_RE = /(?:rs\.?|inr|₹|\$)\s*([\d,]+(?:\.\d{1,2})?)/gi;
const EMAIL_RE = /\b([\w.+-]+@[\w-]+\.[\w.]+)\b/g;

function looksLikeName(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (v.length < 3 || v.length > 60) return false;
  if (/^\d+$/.test(v)) return false;
  if (EMAIL_RE.test(v)) return false;
  return /^[A-Za-z][A-Za-z .'\-]+$/.test(v);
}

// Convert a raw record (CSV row object / extracted text line) into a typed observation.
export function preprocessRecord(raw, index) {
  const issues = [];
  const parsed = {};
  let value = typeof raw === 'string' ? raw : JSON.stringify(raw);
  const cleaned = cleanText(value);
  if (!cleaned) issues.push('Empty record');

  // Try column-based parsing first (CSV rows carry keys).
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw)) {
      const key = cleanText(k).toLowerCase();
      const val = cleanText(v);
      if (!val) continue;
      if (/phone|mobile|contact|msisdn/.test(key)) parsed.phone = val;
      else if (/vehicle|plate|regn|registration/.test(key)) parsed.vehicle = val;
      else if (/account|acc_no|iban/.test(key)) parsed.account = val;
      else if (/date|dob|timestamp/.test(key)) parsed.date = val;
      else if (/time/.test(key)) parsed.time = val;
      else if (/amount|amt|value|currency/.test(key)) parsed.amount = val;
      else if (/name|person|caller|receiver|owner|suspect|subject/.test(key)) parsed.person = val;
      else if (/location|address|place|city|area/.test(key)) parsed.location = val;
      else if (/organization|org|company|bank|firm/.test(key)) parsed.organization = val;
      else parsed.extra ||= { [key]: val };
    }
  }

  // Regex sweep over cleaned text for anything not captured by columns.
  const text = cleaned;
  if (!parsed.phone) {
    const m = [...text.matchAll(PHONE_RE)].map((x) => x[1]).find((s) => s.replace(/\D/g, '').length >= 10);
    if (m) parsed.phone = m;
  }
  if (!parsed.vehicle) {
    const m = [...text.matchAll(VEHICLE_RE)][0];
    if (m) parsed.vehicle = m[1];
  }
  if (!parsed.account) {
    const m = [...text.matchAll(ACCOUNT_RE)][0];
    if (m) parsed.account = m[1];
  }
  if (!parsed.date) {
    const m = [...text.matchAll(DATE_RE)][0];
    if (m) parsed.date = m[1];
  }
  if (!parsed.time) {
    const m = [...text.matchAll(TIME_RE)][0];
    if (m) parsed.time = m[1];
  }
  if (parsed.amount === undefined) {
    const m = [...text.matchAll(CURRENCY_RE)][0];
    if (m) parsed.amount = m[0];
  }
  if (!parsed.organization) {
    const m = [...text.matchAll(/(SBI|HDFC|ICICI|Axis|PNB|BOB|Kotak|Yes Bank)\b/i)][0];
    if (m) parsed.organization = m[1];
  }
  if (!parsed.person && looksLikeName(text.split(/[|,]/)[0])) {
    parsed.person = text.split(/[|,]/)[0].trim();
  }

  // Normalize + validate every typed field. Keep originals; mark issues.
  const normalized = {};
  if (parsed.person) {
    normalized.person = cleanText(parsed.person);
    if (!looksLikeName(normalized.person)) issues.push(`Person name looks invalid: "${normalized.person}"`);
  }
  if (parsed.phone) {
    const n = normalizePhone(parsed.phone);
    normalized.phone = n.normalized;
    issues.push(...n.issues.map((i) => `phone: ${i}`));
    if (n.normalized && n.normalized.replace(/\D/g, '').length < 10) issues.push('phone: fewer than 10 digits');
  }
  if (parsed.vehicle) {
    const n = normalizeVehicle(parsed.vehicle);
    normalized.vehicle = n.normalized;
    issues.push(...n.issues.map((i) => `vehicle: ${i}`));
  }
  if (parsed.account) {
    normalized.account = parsed.account.replace(/\D/g, '');
    if (normalized.account.length < 9) issues.push('account: unusually short');
  }
  if (parsed.date) {
    const n = normalizeDate(parsed.date);
    normalized.date = n.normalized;
    issues.push(...n.issues.map((i) => `date: ${i}`));
  }
  if (parsed.time) {
    const n = normalizeTime(parsed.time);
    normalized.time = n.normalized;
    issues.push(...n.issues.map((i) => `time: ${i}`));
  }
  if (parsed.amount !== undefined && parsed.amount !== '') {
    const n = normalizeCurrency(parsed.amount);
    normalized.amount = n.normalized;
    issues.push(...n.issues.map((i) => `amount: ${i}`));
  }
  if (parsed.location) normalized.location = cleanText(parsed.location);
  if (parsed.organization) normalized.organization = cleanText(parsed.organization);
  if (parsed.email) normalized.email = parsed.email.toLowerCase();
  if (parsed.extra) normalized.extra = parsed.extra;

  if (Object.keys(normalized).length === 0) issues.push('No recognizable entities in record');

  // Fingerprint for duplicate detection across the whole upload.
  const fingerprintInput = Object.entries(normalized)
    .filter(([k]) => k !== 'extra')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v).toLowerCase()}`)
    .join('|');

  return {
    recordIndex: index,
    originalValue: value.slice(0, 2000),
    cleanedValue: cleaned.slice(0, 2000),
    normalizedValue: JSON.stringify(normalized),
    normalizedType: normalized.person ? 'person' : normalized.phone ? 'phone' : normalized.vehicle ? 'vehicle' : normalized.account ? 'account' : normalized.location ? 'location' : 'unknown',
    parsed: normalized,
    issues,
    isValid: issues.length === 0,
    fingerprint: Buffer.from(fingerprintInput).toString('base64').slice(0, 64),
    localConfidence: issues.length === 0 ? 1 : Math.max(0.3, 1 - issues.length * 0.15),
  };
}

export function preprocessRecords(rawRecords) {
  return rawRecords.map((r, i) => preprocessRecord(r, i));
}
