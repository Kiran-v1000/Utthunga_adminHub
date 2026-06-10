import type { Request, Response } from 'express';
import * as svc from './travel.service';
import { auditLog } from '@/middleware/audit';
import { ok } from '@/shared/pagination';
import { travelRequestSchema, paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { notifyUser } from '@/notifications/notification.service';

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    status: z.string().optional(),
    userId: z.string().optional(),
    buId: z.string().optional(),
  })).parse(req.query);
  const result = await svc.listTravelRequests(q);
  res.json(ok(result.data, result.meta));
}

export async function get(req: Request, res: Response) {
  const travel = await svc.getTravelRequest(req.params.id);
  res.json(ok(travel));
}

export async function create(req: Request, res: Response) {
  const body = travelRequestSchema.parse(req.body);
  const travel = await svc.createTravelRequest(req.user!.userId, body);
  await auditLog(req, { action: 'CREATE', entity: 'TravelRequest', entityId: travel.id, newValues: body });
  if (travel.managerId) {
    await notifyUser({
      userId: travel.managerId, type: 'TRAVEL_APPROVAL',
      title: 'Travel approval required',
      body: `New travel request to ${travel.destination} needs your approval.`,
      link: `/travel/${travel.id}`,
    });
  }
  res.status(201).json(ok(travel));
}

export async function updateStatus(req: Request, res: Response) {
  const { status, reason } = z.object({
    status: z.string(), reason: z.string().optional(),
  }).parse(req.body);

  const travel = await svc.updateTravelStatus(req.params.id, status as never, req.user!.userId, reason);
  await auditLog(req, { action: 'UPDATE_STATUS', entity: 'TravelRequest', entityId: req.params.id, newValues: { status, reason } });
  await notifyUser({
    userId: travel.userId, type: 'TRAVEL_STATUS',
    title: `Travel request ${status.replace(/_/g, ' ').toLowerCase()}`,
    body: `Your travel to ${travel.destination} status changed.`,
    link: `/travel/${travel.id}`,
  });
  res.json(ok(travel));
}

export async function stats(_req: Request, res: Response) {
  res.json(ok(await svc.getTravelStats()));
}
