import type { Request, Response } from 'express';
import * as svc from './resource.service';
import { ok } from '@/shared/pagination';
import { roomBookingSchema, paginationSchema } from '@adminhub/shared';
import { z } from 'zod';
import { auditLog } from '@/middleware/audit';

export async function rooms(req: Request, res: Response) {
  res.json(ok(await svc.listRooms(req.query.officeLocation as string)));
}

export async function bookings(req: Request, res: Response) {
  const q = paginationSchema.merge(z.object({
    roomId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).parse(req.query);
  const result = await svc.listBookings(q);
  res.json(ok(result.data, result.meta));
}

export async function createBooking(req: Request, res: Response) {
  const body = roomBookingSchema.parse(req.body);
  const booking = await svc.createBooking(req.user!.userId, body);
  await auditLog(req, { action: 'CREATE', entity: 'RoomBooking', entityId: booking.id });
  res.status(201).json(ok(booking));
}

export async function cancelBooking(req: Request, res: Response) {
  const booking = await svc.cancelBooking(req.params.id, req.user!.userId);
  await auditLog(req, { action: 'CANCEL', entity: 'RoomBooking', entityId: req.params.id });
  res.json(ok(booking));
}
