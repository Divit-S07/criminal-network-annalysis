// config/index.js
// Loads .env via dotenv (which you must place in the project root or this dir).
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Prefer a .env file next to this config dir; fall back to project root.
const envFiles = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '.env'),
];
for (const f of envFiles) {
  if (dotenv.config({ path: f }).error === undefined) break;
}

export const cfg = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/criminal_network_analysis',

  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',

  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-pro',
    fallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 10),
  uploadPath: process.env.UPLOAD_PATH || path.resolve(__dirname, '..', 'uploads'),
  allowedExtensions: new Set((process.env.ALLOWED_EXTENSIONS || 'pdf,docx,csv,jpg,jpeg,png').split(',').map((s) => s.trim().toLowerCase())),
};

// Validation helper (call during startup so misconfiguration fails fast in dev).
export function validateConfig() {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production') missing.push('JWT_SECRET');
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'replace-with-your-gemini-api-key') missing.push('GEMINI_API_KEY');
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://127.0.0.1:27017/criminal_network_analysis') missing.push('MONGODB_URI');
  if (cfg.nodeEnv === 'production' && missing.length) {
    throw new Error(`Production startup blocked: missing env keys -> ${missing.join(', ')}. Set them in .env.`);
  }
  return { ok: true, missing: missing.length ? missing : null };
}
