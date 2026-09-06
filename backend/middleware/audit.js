// middleware/audit.js
import { logger } from '../config/logger.js';

export function auditLog(action, options = {}) {
  return (req, res, next) => {
    res.locals.auditAction = action;
    res.locals.auditOptions = options || {};
    next();
  };
}

export async function auditNow(user, action, options = {}) {
  logger.info('Audit event', { action, user: user?.id, details: options.details });
}

export function auditCompletion(req, res, next) {
  res.on('finish', () => {
    const action = res.locals?.auditAction;
    if (action) {
      logger.info('Audit completed', { action, status: res.statusCode });
    }
  });
  next();
}
