// extraction/records.js — turn extracted file content into raw record list.
export function toRawRecords(extracted) {
  if (extracted.records && Array.isArray(extracted.records) && extracted.records.length > 0) {
    return extracted.records;
  }
  if (!extracted.text) return [];
  return extracted.text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line) => {
      // Pipe/delimited OCR lines become pseudo-columns for the preprocessor.
      const parts = line.split(/\s*\|\s*|\s{2,}|\t/).filter(Boolean);
      if (parts.length >= 2) {
        const obj = {};
        parts.forEach((p, i) => { obj[`field${i + 1}`] = p; });
        return obj;
      }
      return line;
    });
}
