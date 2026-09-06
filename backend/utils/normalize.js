// utils/normalize.js
// Deterministic local normalization. We never delete invalid data — we mark issues.

// Phone normalization: strip everything except digits and leading +, then
// standardize to E.164-ish form when possible.
export function normalizePhone(raw) {
  if (!raw) return { normalized: '', issues: ['Empty phone value'] };
  const cleaned = String(raw).trim();
  const digitsOnly = cleaned.replace(/[^\d+]/g, '');
  const issues = [];

  // If there's a leading +, keep it; otherwise prepend none (keep raw digits).
  let normalized = digitsOnly;
  if (/^\+?\d+$/.test(normalized)) {
    // Very light E.164-ish normalization: if starts with a national prefix like 91,
    // leave as-is but flag if too short for a plausible number.
    if (normalized.length >= 8) {
      // plausible
    } else {
      issues.push('Phone too short after normalization');
    }
  } else {
    issues.push('Phone contains non-numeric characters after cleaning');
    // Fallback: keep digits only
    normalized = digitsOnly.replace(/\D/g, '') || '';
  }

  return { normalized, issues };
}

// Vehicle number normalization: uppercase, remove spaces, keep alphanumeric.
export function normalizeVehicle(raw) {
  if (!raw) return { normalized: '', issues: ['Empty vehicle value'] };
  const cleaned = String(raw).trim().toUpperCase();
  const normalized = cleaned.replace(/[^A-Z0-9]/g, '');
  const issues = [];
  if (normalized.length < 4) issues.push('Vehicle number unusually short');
  if (!/[A-Z]/.test(normalized) || !/[0-9]/.test(normalized)) {
    issues.push('Vehicle number may be missing letters or digits');
  }
  return { normalized, issues };
}

// Date normalization: try multiple common formats and return ISO where possible.
export function normalizeDate(raw) {
  if (!raw) return { normalized: '', issues: ['Empty date value'] };
  const cleaned = String(raw).trim();
  const issues = [];

  // Try ISO-like, DD/MM/YYYY, MM/DD/YYYY, DD-Mon-YYYY, etc.
  const candidates = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})$/,
    /^(\d{4})[\/\-.](\d{2})[\/\-.](\d{2})$/,
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})$/i,
    /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{2,4})$/i,
  ];

  let match;
  for (const re of candidates) {
    match = cleaned.match(re);
    if (match) break;
  }

  if (!match) {
    // Heuristic: if it looks like a date-ish string, keep it but flag.
    issues.push('Date format not recognized');
    return { normalized: cleaned, issues };
  }

  let year, month, day;
  if (match[0].match(/^\d{4}-/)) {
    year = match[1]; month = match[2]; day = match[3];
  } else if (match[1]?.length === 4) {
    year = match[1]; month = match[2]; day = match[3];
  } else if (match[3]?.length === 4) {
    // DD/MM/YYYY style
    day = match[1]; month = match[2]; year = match[3];
  } else if (match[1] && match[2] && ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].includes(match[2].slice(0, 3).toUpperCase())) {
    day = match[1]; month = match[2]; year = match[3];
  } else {
    issues.push('Date format ambiguous');
    return { normalized: cleaned, issues };
  }

  // Build ISO date if plausible.
  const monthNum = monthToNumber(month);
  if (monthNum < 0) {
    issues.push('Month not recognized');
    return { normalized: cleaned, issues };
  }
  if (String(year).length < 4) {
    // Attempt to assume 20xx if 2-digit
    year = String(Number(year) + 2000);
  }
  const iso = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { normalized: iso, issues };
}

// Time normalization: HH:MM or HH:MM:SS -> 24h HH:MM:SS
export function normalizeTime(raw) {
  if (!raw) return { normalized: '', issues: ['Empty time value'] };
  const cleaned = String(raw).trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return { normalized: cleaned, issues: ['Time format not recognized'] };

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] ? Number(match[3]) : 0;
  const meridiem = (match[4] || '').toLowerCase();

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  const issues = [];
  if (hour > 23 || minute > 59 || second > 59) {
    issues.push('Out-of-range time components');
  }

  const normalized = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  return { normalized, issues };
}

// Currency normalization: strip symbols, normalize to numeric string.
export function normalizeCurrency(raw) {
  if (!raw) return { normalized: '', issues: ['Empty currency value'] };
  const cleaned = String(raw).trim();
  const numeric = cleaned.replace(/[^0-9.]/g, '');
  const num = Number(numeric);
  if (isNaN(num)) return { normalized: cleaned, issues: ['Currency value not parseable'] };
  // Keep up to 2 decimals, as string
  const normalized = num.toFixed(2);
  return { normalized, issues };
}

// Generic text cleaning: collapse whitespace, trim, normalize unicode.
export function cleanText(raw) {
  if (!raw) return '';
  return String(raw)
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
}

// Phone normalization helper for fingerprints (used in dedup).
export function phoneFingerprint(raw) {
  const n = normalizePhone(raw);
  return n.normalized.toLowerCase();
}

// Vehicle fingerprint.
export function vehicleFingerprint(raw) {
  const n = normalizeVehicle(raw);
  return n.normalized;
}

// Doc hash for record-level dedup (normalized values + source location).
export function recordFingerprint(record) {
  const parts = [
    record.normalizedValue || record.originalValue || '',
    record.sourceLocation || '',
    record.normalizedType || '',
  ];
  return parts
    .map((p) => (p || '').toString().trim().toLowerCase())
    .filter(Boolean)
    .join(' | ');
}

function monthToNumber(m) {
  const map = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  if (typeof m === 'number') return m;
  return map[m.slice(0, 3).toLowerCase()] ?? -1;
}
