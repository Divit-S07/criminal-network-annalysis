// preprocessing/clean.js
// Deterministic local cleaning before AI. Never deletes invalid data — marks issues.
import { cleanText } from '../utils/normalize.js';

// Remove common OCR noise artifacts.
export function cleanOcrNoise(text) {
  if (!text) return '';
  return String(text)
    .replace(/[|¦]/g, ' | ')
    .replace(/[""]�/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();
}

// Clean a single record value: whitespace + OCR noise.
export function cleanRecordValue(raw) {
  if (raw === null || raw === undefined) return { cleaned: '', issues: ['Empty value'] };
  const cleaned = cleanOcrNoise(String(raw));
  const issues = [];
  if (!cleaned) issues.push('Value empty after cleaning');
  return { cleaned, issues };
}

// Clean a full text document (PDF/DOCX/OCR output).
export function cleanDocument(text) {
  return cleanOcrNoise(text);
}

// Clean an array of CSV records (objects) — returns cleaned copies + issues.
export function cleanCsvRecords(records) {
  return (records || []).map((rec, idx) => {
    const cleaned = {};
    const issues = [];
    for (const [k, v] of Object.entries(rec || {})) {
      const key = cleanText(k);
      const { cleaned: val, issues: vi } = cleanRecordValue(v);
      cleaned[key] = val;
      if (vi.length) issues.push({ field: key, index: idx, issues: vi });
    }
    return { record: cleaned, issues };
  });
}
