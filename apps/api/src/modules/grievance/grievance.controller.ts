import type { Request, Response } from 'express';
import * as svc from './grievance.service';
import { ok } from '@/shared/pagination';
import { grievanceSchema, paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';
import { notifyUser } from '@/notifications/notification.service';

export async function list(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    assignedToId: z.string().optional(),
  })).parse(req.query);
  const result = await svc.listTickets(q);
  res.json(ok(result.data, result.meta));
}

export async function get(req: Request, res: Response) {
  res.json(ok(await svc.getTicket(req.params.id)));
}

export async function create(req: Request, res: Response) {
  const body = grievanceSchema.parse(req.body);
  const ticket = await svc.createTicket(req.user!.userId, body);
  await auditLog(req, { action: 'CREATE', entity: 'GrievanceTicket', entityId: ticket.id });
  res.status(201).json(ok(ticket));
}

export async function update(req: Request, res: Response) {
  const body = z.object({
    status: z.string().optional(),
    assignedToId: z.string().cuid().optional(),
    resolution: z.string().optional(),
  }).parse(req.body);

  const ticket = await svc.updateTicket(req.params.id, body as never);
  await auditLog(req, { action: 'UPDATE', entity: 'GrievanceTicket', entityId: req.params.id, newValues: body });

  if (body.status) {
    await notifyUser({
      userId: ticket.submittedById, type: 'GRIEVANCE_UPDATE',
      title: `Ticket ${ticket.ticketNumber} ${body.status.replace(/_/g, ' ').toLowerCase()}`,
      body: ticket.resolution ?? 'Your ticket has been updated.',
      link: `/grievances/${ticket.id}`,
    });
  }
  res.json(ok(ticket));
}

export async function addComment(req: Request, res: Response) {
  const { content, isInternal } = z.object({
    content: z.string().min(1),
    isInternal: z.boolean().default(false),
  }).parse(req.body);
  const comment = await svc.addComment(req.params.id, req.user!.userId, content, isInternal);
  res.status(201).json(ok(comment));
}
