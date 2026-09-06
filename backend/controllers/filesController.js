// controllers/filesController.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExtractionAdapter } from '../extraction/adapter.js';
import { cfg } from '../config/index.js';
import { logger } from '../config/logger.js';

import multer from 'multer';

const upload = multer({ dest: cfg.uploadPath || './uploads' });
export const uploadMiddleware = upload.single('file');

export async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' });
  }
  const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
  if (!cfg.allowedExtensions.has(ext)) {
    await fs.rm(req.file.path, { force: true });
    return res.status(400).json({ success: false, error: `Unsupported file type ".${ext}". Allowed: PDF, DOCX, CSV, JPG, JPEG, PNG` });
  }
  if (req.file.size > cfg.maxFileSizeMb * 1024 * 1024) {
    await fs.rm(req.file.path, { force: true });
    return res.status(400).json({ success: false, error: `File exceeds the ${cfg.maxFileSizeMb}MB limit` });
  }

  const fileId = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const sha256 = await fileExtractionAdapter.computeSha256(req.file.path);
  const doc = {
    id: fileId,
    originalName: req.file.originalname,
    sizeBytes: req.file.size,
    extension: ext,
    sha256,
    storagePath: req.file.path,
    category: req.body?.category || '',
    uploadedAt: new Date().toISOString(),
  };

  inMemoryFiles.set(fileId, doc);
  res.status(201).json({ success: true, data: doc });
}

export async function listFiles(req, res) {
  res.json({
    success: true,
    data: Array.from(inMemoryFiles.values()),
  });
}

export async function getFile(req, res) {
  const doc = inMemoryFiles.get(req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: 'File not found' });
  res.json({
    success: true,
    data: doc,
  });
}
