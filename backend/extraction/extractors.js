// extraction/extractors.js
// Deterministic regex/parser entity extraction before Gemini.
import { detectRecordType } from '../preprocessing/normalize.js';

const PHONE_RE = /(?:\+?91[\s-]?)?\b[6-9]\d{9}\b/g;
const VEHICLE_RE = /\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{0,3}\s?\d{4}\b/g;
const ACCOUNT_RE = /\b\d{11,18}\b/g;
const DATE_RE = /\b\d{4}-\d{2}-\d{2}\b|\b\d{2}[\/\-.]\d{2}[\/\-.]\d{4}\b/g;
const TIME_RE = /\b\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm|AM|PM)?\b/g;
const AMOUNT_RE = /(?:rs\.?|inr|₹|\$)\s?[\d,]+(?:\.\d{1,2})?/gi;
const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g;
const PERSON_RE = /\b(?:Mr|Mrs|Ms|Dr|Shri|Smt)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
const ORG_RE = /\b[A-Z][A-Za-z&.\s]+(?:Pvt\.?\s?Ltd|Ltd|LLP|Inc|Corporation|Bank)\b/g;

function uniq(arr) {
  return [...new Set((arr || []).map((s) => String(s).trim()).filter(Boolean))];
}

// Extract obvious entities from a raw text chunk.
export function extractEntitiesFromText(text) {
  const src = String(text || '');
  return {
    phones: uniq(src.match(PHONE_RE) || []),
    vehicles: uniq((src.match(VEHICLE_RE) || []).map((v) => v.replace(/\s+/g, '').toUpperCase())),
    accounts: uniq(src.match(ACCOUNT_RE) || []),
    dates: uniq(src.match(DATE_RE) || []),
    times: uniq(src.match(TIME_RE) || []),
    amounts: uniq(src.match(AMOUNT_RE) || []),
    emails: uniq(src.match(EMAIL_RE) || []),
    persons: uniq(src.match(PERSON_RE) || []),
    organizations: uniq(src.match(ORG_RE) || []),
  };
}

// Extract candidate entities from cleaned CSV records.
export function extractEntitiesFromRecords(records) {
  const out = { persons: [], phones: [], vehicles: [], accounts: [], locations: [], dates: [], times: [], amounts: [] };
  for (const { record } of records || []) {
    const fields = record || {};
    const values = Object.values(fields).join(' | ');
    const type = detectRecordType(fields, values);
    for (const [key, value] of Object.entries(fields)) {
      const k = key.toLowerCase();
      if (!value) continue;
      if (/phone|mobile|contact/.test(k)) out.phones.push(...uniq(String(value).match(PHONE_RE) || []));
      else if (/vehicle|registration/.test(k)) out.vehicles.push(...(String(value).match(VEHICLE_RE) || []).map((v) => v.replace(/\s+/g, '').toUpperCase()));
      else if (/account/.test(k)) out.accounts.push(...uniq(String(value).match(ACCOUNT_RE) || []));
      else if (/name|person/.test(k)) out.persons.push(value);
      else if (/location|address|place|city|district/.test(k)) out.locations.push(value);
      else if (/date/.test(k)) out.dates.push(...uniq(String(value).match(DATE_RE) || []));
      else if (/time/.test(k)) out.times.push(...uniq(String(value).match(TIME_RE) || []));
      else if (/amount|currency|value/.test(k)) out.amounts.push(...uniq(String(value).match(AMOUNT_RE) || [value]));
    }
    if (type === 'unknown' && values.trim()) {
      out.persons.push(...uniq(values.match(PERSON_RE) || []));
      out.phones.push(...uniq(values.match(PHONE_RE) || []));
      out.vehicles.push(...(values.match(VEHICLE_RE) || []).map((v) => v.replace(/\s+/g, '').toUpperCase()));
    }
  }
  return {
    persons: uniq(out.persons),
    phones: uniq(out.phones),
    vehicles: uniq(out.vehicles),
    accounts: uniq(out.accounts),
    locations: uniq(out.locations),
    dates: uniq(out.dates),
    times: uniq(out.times),
    amounts: uniq(out.amounts),
  };
}
