import crypto from 'crypto';
import type { Request } from 'express';

export function validateHmac(req: Request, secret: string): boolean {
  const signature = req.headers['x-signature'] as string;
  if (!signature) return false;

  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const actual = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
}
