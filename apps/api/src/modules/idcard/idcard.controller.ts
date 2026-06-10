import type { Request, Response } from 'express';
import * as svc from './idcard.service';
import { ok } from '@/shared/pagination';
import { paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    status: z.string().optional(), employeeType: z.string().optional(),
  })).parse(req.query);
  const result = await svc.list(q);
  res.json(ok(result.data, result.meta));
}

export async function get(req: Request, res: Response) {
  res.json(ok(await svc.get(req.params.id)));
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = z.object({ status: z.string() }).parse(req.body);
  const card = await svc.updateStatus(req.params.id, status as never, req.user!.userId);
  await auditLog(req, { action: 'UPDATE_STATUS', entity: 'IDCard', entityId: req.params.id, newValues: { status } });
  res.json(ok(card));
}
