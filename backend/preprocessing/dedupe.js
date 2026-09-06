// preprocessing/dedupe.js
// Duplicate record detection using normalized fingerprints.
import crypto from 'node:crypto';
import { recordFingerprint } from '../utils/normalize.js';

export function fingerprintRecord({ normalizedValue, sourceLocation, normalizedType }) {
  return recordFingerprint({ normalizedValue, sourceLocation, normalizedType });
}

export function hashFingerprint(fp) {
  return crypto.createHash('sha256').update(fp).digest('hex').slice(0, 32);
}

// Given an array of records (with normalizedValue/normalizedType/sourceLocation),
// returns { unique, duplicates } where duplicates keeps the first occurrence only.
export function detectDuplicates(records) {
  const seen = new Map();
  const unique = [];
  const duplicates = [];
  for (const rec of records) {
    const fp = hashFingerprint(fingerprintRecord(rec));
    if (seen.has(fp)) {
      duplicates.push({ record: rec, fingerprint: fp, firstOccurrenceIndex: seen.get(fp) });
    } else {
      seen.set(fp, unique.length);
      unique.push({ ...rec, fingerprint: fp });
    }
  }
  return { unique, duplicates };
}
