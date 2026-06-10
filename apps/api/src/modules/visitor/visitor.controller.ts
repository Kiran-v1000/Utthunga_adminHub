import type { Request, Response } from 'express';
import * as svc from './visitor.service';
import { auditLog } from '@/middleware/audit';
import { ok } from '@/shared/pagination';
import { visitorRequestSchema, paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { notifyUser } from '@/notifications/notification.service';
import { emitEvent } from '@/notifications/socket';
import { SOCKET_EVENTS } from '@adminhub/shared';

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    status: z.string().optional(),
    officeLocation: z.string().optional(),
    date: z.string().optional(),
  })).parse(req.query);
  const result = await svc.listVisitors(q);
  res.json(ok(result.data, result.meta));
}

export async function get(req: Request, res: Response) {
  const visitor = await svc.getVisitor(req.params.id);
  res.json(ok(visitor));
}

export async function create(req: Request, res: Response) {
  const body = visitorRequestSchema.parse(req.body);
  const visitor = await svc.createVisitor(body);
  await auditLog(req, { action: 'CREATE', entity: 'VisitorRequest', entityId: visitor.id, newValues: body });
  await notifyUser({
    userId: body.hostId, type: 'VISITOR_REQUEST',
    title: 'New visitor request', body: `${body.guestName} from ${body.company ?? 'Unknown'} scheduled.`,
    link: `/visitors/${visitor.id}`,
  });
  res.status(201).json(ok(visitor));
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = z.object({ status: z.string() }).parse(req.body);
  const visitor = await svc.updateStatus(req.params.id, status as never, req.user!.userId);
  await auditLog(req, { action: 'UPDATE_STATUS', entity: 'VisitorRequest', entityId: req.params.id, newValues: { status } });

  if (status === 'CHECKED_IN') {
    emitEvent(SOCKET_EVENTS.VISITOR_CHECKIN, { ...visitor, checkedInAt: new Date() });
  }
  res.json(ok(visitor));
}

export async function todayStats(req: Request, res: Response) {
  const stats = await svc.getTodayStats(req.query.officeLocation as string);
  res.json(ok(stats));
}
