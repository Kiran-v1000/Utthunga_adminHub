import type { Request, Response } from 'express';
import * as svc from './shipment.service';
import { ok } from '@/shared/pagination';
import { shipmentSchema, paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    status: z.string().optional(), type: z.string().optional(),
  })).parse(req.query);
  res.json(ok((await svc.list(q)).data, (await svc.list(q)).meta));
}

export async function get(req: Request, res: Response) {
  res.json(ok(await svc.get(req.params.id)));
}

export async function create(req: Request, res: Response) {
  const body = shipmentSchema.parse(req.body);
  const shipment = await svc.create(req.user!.userId, body);
  await auditLog(req, { action: 'CREATE', entity: 'ShipmentRequest', entityId: shipment.id });
  res.status(201).json(ok(shipment));
}

export async function updateStatus(req: Request, res: Response) {
  const { status, location, notes } = z.object({
    status: z.string(), location: z.string().optional(), notes: z.string().optional(),
  }).parse(req.body);
  const shipment = await svc.updateStatus(req.params.id, status as never, req.user!.userId, location, notes);
  await auditLog(req, { action: 'UPDATE_STATUS', entity: 'ShipmentRequest', entityId: req.params.id, newValues: { status } });
  res.json(ok(shipment));
}
