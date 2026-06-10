import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.flatten().fieldErrors,
    });
  }

  const status = (err as { status?: number }).status ?? 500;
  const message = status < 500 ? err.message : (process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error');

  return res.status(status).json({ success: false, error: message });
}
