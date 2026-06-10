import type { Request, Response } from 'express';
import * as svc from './visa.service';
import { ok } from '@/shared/pagination';
import { paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';

const visaCreateSchema = z.object({
  userId: z.string().cuid(),
  visaNumber: z.string().min(3),
  country: z.string().min(2),
  visaType: z.string().min(2),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  passportNumber: z.string().min(6),
  documentUrls: z.array(z.string().url()).optional(),
});

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    userId: z.string().optional(),
    expiringSoon: z.coerce.boolean().optional(),
  })).parse(req.query);
  const result = await svc.listVisaRecords(q);
  res.json(ok(result.data, result.meta));
}

export async function get(req: Request, res: Response) {
  res.json(ok(await svc.getVisaRecord(req.params.id)));
}

export async function create(req: Request, res: Response) {
  const body = visaCreateSchema.parse(req.body);
  const record = await svc.createVisaRecord(body.userId, body);
  await auditLog(req, { action: 'CREATE', entity: 'VisaRecord', entityId: record.id });
  res.status(201).json(ok(record));
}
