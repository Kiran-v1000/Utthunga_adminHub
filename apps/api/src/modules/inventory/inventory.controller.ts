import type { Request, Response } from 'express';
import * as svc from './inventory.service';
import { ok } from '@/shared/pagination';
import { paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    category: z.string().optional(),
    officeLocation: z.string().optional(),
    lowStock: z.coerce.boolean().optional(),
  })).parse(req.query);
  const result = await svc.list(q);
  res.json(ok(result.data, result.meta));
}

export async function adjustStock(req: Request, res: Response) {
  const { delta, type, reason } = z.object({
    delta: z.number().int(),
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER']),
    reason: z.string().min(2),
  }).parse(req.body);
  const item = await svc.adjustStock(req.params.id, delta, type, reason, req.user!.userId);
  await auditLog(req, { action: 'ADJUST_STOCK', entity: 'InventoryItem', entityId: req.params.id, newValues: { delta, type, reason } });
  res.json(ok(item));
}

export async function lowStockAlerts(req: Request, res: Response) {
  res.json(ok(await svc.getLowStockAlerts(req.query.officeLocation as string)));
}
