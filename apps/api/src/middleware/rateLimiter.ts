import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

export const rateLimiter: RequestHandler = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
  // Skip health check and all auth endpoints so login/refresh are never rate-limited
  skip: (req) => req.path === '/health' || req.path.startsWith('/api/auth'),
});
