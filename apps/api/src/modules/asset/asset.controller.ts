import type { Request, Response } from 'express';
import * as svc from './asset.service';
import { ok } from '@/shared/pagination';
import { paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';

const assetSchema = z.object({
  name: z.string().min(2), category: z.string().min(2),
  serialNumber: z.string().optional(), brand: z.string().optional(), model: z.string().optional(),
  purchaseDate: z.string().optional(), purchaseCost: z.number().optional(),
  depreciationMethod: z.enum(['SLM', 'WDV']).optional(),
  warrantyExpiry: z.string().optional(), officeLocation: z.enum(['BANGALORE', 'PUNE']),
  ownerId: z.string().optional(), costCenter: z.string().optional(),
  glCode: z.string().optional(), notes: z.string().optional(),
});

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    status: z.string().optional(),
    officeLocation: z.string().optional(),
    category: z.string().optional(),
  })).parse(req.query);
  const result = await svc.list(q);
  res.json(ok(result.data, result.meta));
}

export async function get(req: Request, res: Response) {
  res.json(ok(await svc.get(req.params.id)));
}

export async function create(req: Request, res: Response) {
  const body = assetSchema.parse(req.body);
  const asset = await svc.create(body);
  await auditLog(req, { action: 'CREATE', entity: 'Asset', entityId: asset.id });
  res.status(201).json(ok(asset));
}

export async function transfer(req: Request, res: Response) {
  const body = z.object({
    toOwnerId: z.string().cuid(), toLocation: z.string(), reason: z.string(),
  }).parse(req.body);
  const asset = await svc.transferAsset(req.params.id, body.toOwnerId, body.toLocation, body.reason, req.user!.userId);
  await auditLog(req, { action: 'TRANSFER', entity: 'Asset', entityId: req.params.id, newValues: body });
  res.json(ok(asset));
}
