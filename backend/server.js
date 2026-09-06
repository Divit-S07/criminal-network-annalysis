// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cfg, validateConfig } from './config/index.js';
import { logger, setLogLevel } from './config/logger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authMiddleware, optionalAuth } from './middleware/auth.js';
import { auditLog, auditCompletion } from './middleware/audit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

import authRouter from './routes/auth.js';
import casesRouter from './routes/cases.js';
import filesRouter from './routes/files.js';
import analysisRouter from './routes/analysis.js';
import entitiesRouter from './routes/entities.js';
import relationshipsRouter from './routes/relationships.js';
import evidenceRouter from './routes/evidence.js';
import alertsRouter from './routes/alerts.js';
import timelineRouter from './routes/timeline.js';
import mapRouter from './routes/mapData.js';
import networkRouter from './routes/network.js';
import reportsRouter from './routes/reports.js';
import healthRouter from './routes/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
setLogLevel(cfg.nodeEnv === 'production' ? 'info' : 'debug');

const app = express();

// Basic security headers + CORS scoped to the frontend in dev.
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: cfg.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply a loose rate limiter on auth + analysis endpoints to avoid abuse.
app.use('/api/auth', rateLimiter);
app.use('/api/analysis', rateLimiter);

// Static serving of uploaded files (in prod, serve via CDN/object store instead).
const uploadsPath = path.resolve(cfg.uploadPath);
app.use('/uploads', express.static(uploadsPath));

// Audit log middleware (attaches request id, logs completed requests for sensitive actions).
app.use((req, res, next) => {
  res.locals.auditAction = null;
  next();
});
app.use(auditCompletion);

// Routers
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/cases', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), casesRouter);
app.use('/api/files', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), filesRouter);
app.use('/api/analysis', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), analysisRouter);
app.use('/api/entities', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), entitiesRouter);
app.use('/api/relationships', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), relationshipsRouter);
app.use('/api/evidence', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), evidenceRouter);
app.use('/api/alerts', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), alertsRouter);
app.use('/api/timeline', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), timelineRouter);
app.use('/api/map-data', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), mapRouter);
app.use('/api/network', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), networkRouter);
app.use('/api/reports', authMiddleware(['ADMIN', 'INVESTIGATOR', 'ANALYST']), reportsRouter);

// Global error handling
app.use(notFound);
app.use(errorHandler);

async function boot() {
  const validation = validateConfig();
  if (!validation.ok) {
    logger.warn('Startup config warnings', { missing: validation.missing });
  }
  try {
    app.listen(cfg.port, () => {
      logger.info('Backend listening', { port: cfg.port, nodeEnv: cfg.nodeEnv });
    });
  } catch (err) {
    logger.error('Failed to start backend', { error: err?.message });
    process.exit(1);
  }
}

// Handle SIGINT/SIGTERM gracefully.
const shutdownSignals = ['SIGINT', 'SIGTERM'];
for (const sig of shutdownSignals) {
  process.on(sig, async () => {
    logger.info('Shutdown requested', { signal: sig });
    process.exit(0);
  });
}

boot();
