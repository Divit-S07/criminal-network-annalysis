// preprocessing/normalize.js
// Re-export the shared normalization utilities for pipeline use.
export {
  normalizePhone,
  normalizeVehicle,
  normalizeDate,
  normalizeTime,
  normalizeCurrency,
  cleanText,
  recordFingerprint,
  phoneFingerprint,
  vehicleFingerprint,
} from '../utils/normalize.js';

import { normalizePhone, normalizeVehicle, normalizeDate, normalizeTime, normalizeCurrency, cleanText } from '../utils/normalize.js';

// Detect the most likely record type from a field/value pair.
export function detectRecordType(fields = {}, value = '') {
  const hay = `${Object.keys(fields).join(' ')} ${Object.values(fields).join(' ')} ${value}`.toLowerCase();
  if (/phone|mobile|cdr|number dialled|calling/.test(hay)) return 'phone';
  if (/vehicle|registration|chassis|rc |rto/.test(hay)) return 'vehicle';
  if (/account|bank|ifsc|transaction|utr/.test(hay)) return 'account';
  if (/location|address|lat|lng|place|district|gps/.test(hay)) return 'location';
  if (/name|person|suspect|accused|age|gender/.test(hay)) return 'person';
  if (/case|fir|complaint/.test(hay)) return 'case';
  if (/organization|company|firm|ltd|pvt/.test(hay)) return 'organization';
  if (/event|incident|meeting|occurrence/.test(hay)) return 'event';
  return 'unknown';
}

// Normalize a single extracted value by detected type.
export function normalizeValue(type, raw) {
  switch (type) {
    case 'phone':
      return normalizePhone(raw);
    case 'vehicle':
      return normalizeVehicle(raw);
    case 'account': {
      const digits = String(raw || '').replace(/[^0-9A-Za-z-]/g, '').toUpperCase();
      const issues = digits.length < 8 ? ['Account number unusually short'] : [];
      return { normalized: digits, issues };
    }
    case 'location': {
      const normalized = cleanText(raw);
      return { normalized, issues: normalized ? [] : ['Empty location'] };
    }
    case 'person':
    case 'organization':
    case 'case':
    case 'event': {
      const normalized = cleanText(raw);
      return { normalized, issues: normalized ? [] : ['Empty value'] };
    }
    default: {
      const d = normalizeDate(raw);
      if (!d.issues.length) return d;
      const t = normalizeTime(raw);
      if (!t.issues.length) return t;
      const c = normalizeCurrency(raw);
      if (!c.issues.length) return c;
      return { normalized: cleanText(raw), issues: [] };
    }
  }
}
