// middleware/errorHandler.js
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  if (err) {
    const isTrusted = !err.statusCode || (err.statusCode >= 400 && err.statusCode < 500);
    const statusCode = err.statusCode || 500;
    const message = isTrusted ? (err.message || 'An error occurred.') : 'Internal server error.';

    if (!isTrusted) {
      logger.error('Untrusted error', {
        path: req?.originalUrl,
        statusCode,
        error: err?.message,
        stack: err?.stack,
      });
    } else {
      logger.warn('Trusted error', {
        path: req?.originalUrl,
        statusCode,
        error: err?.message,
      });
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(cfg.nodeEnv !== 'production' && err?.errors ? { details: err.errors } : {}),
    });
  } else {
    next();
  }
}

// Re-export config for the trusted/untrusted split above.
import { cfg } from '../config/index.js';
