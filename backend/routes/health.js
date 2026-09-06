import express from 'express';
import { logger } from '../config/logger.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const dbState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  return res.json({
    success: true,
    status: 'ok',
    db: dbState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

export default router;
