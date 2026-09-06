// extraction/adapter.js
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { logger } from '../config/logger.js';
import { cfg } from '../config/index.js';

// We lazy-import heavy modules so startup stays light.
const MODULES = new Map();

async function load(name) {
  if (MODULES.has(name)) return MODULES.get(name).exports;
  let mod;
  if (name === 'pdf-parse') {
    mod = await import('pdf-parse');
  } else if (name === 'mammoth') {
    mod = await import('mammoth');
  } else if (name === 'csv-parse') {
    mod = await import('csv-parse/sync');
  } else if (name === 'tesseract') {
    mod = await import('tesseract.js');
  } else {
    throw new Error(`Unknown extraction module: ${name}`);
  }
  MODULES.set(name, { exports: mod.default || mod });
  return MODULES.get(name).exports;
}

// ── SHA-256 duplicate check ──────────────────────────────────────────────
export async function computeSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// ── Supported extensions ─────────────────────────────────────────────────
export function isSupported(filename) {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return cfg.allowedExtensions.has(ext);
}

export function getExtension(filename) {
  return path.extname(filename).slice(1).toLowerCase();
}

export function getMimeForExt(ext) {
  const map = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  return map[ext] || 'application/octet-stream';
}

// ── PDF ──────────────────────────────────────────────────────────────────
export async function extractPdf(filePath) {
  const pdfParse = await load('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  // pdf-parse v1.x exports a function taking a Buffer.
  const data = await new Promise((resolve, reject) => {
    try {
      pdfParse(dataBuffer, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    } catch (err) {
      reject(err);
    }
  });
  return {
    text: data.text || '',
    pages: data.numpages || 0,
    info: data.info || null,
  };
}

// ── DOCX ─────────────────────────────────────────────────────────────────
export async function extractDocx(filePath) {
  const mammoth = await load('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return {
    text: result.value || '',
    messages: result.messages || [],
  };
}

// ── CSV ──────────────────────────────────────────────────────────────────
export async function extractCsv(filePath) {
  const parse = await load('csv-parse');
  const content = fs.readFileSync(filePath, 'utf-8');
  let records;
  try {
    records = parse.parseString(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    // Some malformed CSV can throw; return empty and mark validation issues later.
    records = [];
  }
  // Build a human-readable text representation for downstream OCR-like handling.
  const text = records
    .map((r) => Object.values(r).join(' | '))
    .join('\n');
  return {
    text,
    records,
  };
}

// ── Image OCR ────────────────────────────────────────────────────────────
export async function extractImage(filePath) {
  const tesseract = await load('tesseract');
  const result = await tesseract.recognize(filePath, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        logger.debug('Tesseract progress', { status: m.status });
      }
    },
  });
  return {
    text: result.data.text || '',
    confidence: result.data.confidence ?? 0,
  };
}

// ── Router by extension ──────────────────────────────────────────────────
const EXTRACTORS = {
  pdf: 'extractPdf',
  docx: 'extractDocx',
  csv: 'extractCsv',
  jpg: 'extractImage',
  jpeg: 'extractImage',
  png: 'extractImage',
};

export async function extractFile(filePath, ext) {
  const fn = EXTRACTORS[ext];
  if (!fn) throw new Error(`No extractor for extension: ${ext}`);
  const extractor = this[fn];
  if (!extractor) throw new Error(`Extractor function missing: ${fn}`);
  return extractor(filePath);
}

// Bind extractors onto the adapter object for clean internal usage.
export const fileExtractionAdapter = {
  extractPdf,
  extractDocx,
  extractCsv,
  extractImage,
  extractFile,
  computeSha256,
  isSupported,
  getExtension,
  getMimeForExt,
};
