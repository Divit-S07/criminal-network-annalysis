// middleware/rateLimiter.js
// Lightweight in-memory rate limiter. In production, replace with a
// distributed store (Redis) if the service runs on multiple instances.

const LIMITER_TTL = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 20;        // per IP per minute on sensitive endpoints

const buckets = new Map();

function now() {
  return Date.now();
}

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const bucket = buckets.get(ip) ?? { count: 0, resetAt: now() + LIMITER_TTL };

  if (now() > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now() + LIMITER_TTL;
  }

  bucket.count += 1;
  buckets.set(ip, bucket);

  // Periodically purge stale buckets to avoid memory leak (best effort).
  if (bucket.count === 1 && Math.random() < 0.05) {
    for (const [key, b] of buckets) {
      if (now() > b.resetAt) buckets.delete(key);
    }
  }

  if (bucket.count > MAX_ATTEMPTS) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again.',
      retryAfterSeconds: Math.ceil((bucket.resetAt - now()) / 1000) || 1,
    });
    return;
  }

  next();
}
