import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import { nanoid } from 'nanoid';
import type { VisitorStatus } from '@prisma/client';

export async function listVisitors(query: {
  page?: number; limit?: number; status?: string;
  officeLocation?: string; date?: string;
}) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.officeLocation) where.officeLocation = query.officeLocation;
  if (query.date) {
    const d = new Date(query.date);
    where.visitDate = { gte: d, lt: new Date(d.getTime() + 86400000) };
  }

  const [data, total] = await Promise.all([
    prisma.visitorRequest.findMany({
      where, skip, take,
      orderBy: { visitDate: 'desc' },
      include: { host: { select: { id: true, name: true, email: true } }, meetingRoom: true, badge: true },
    }),
    prisma.visitorRequest.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function getVisitor(id: string) {
  return prisma.visitorRequest.findUniqueOrThrow({
    where: { id },
    include: {
      host: { select: { id: true, name: true, email: true, department: true } },
      meetingRoom: true, badge: true, feedback: true,
    },
  });
}

export async function createVisitor(data: {
  guestName: string; guestEmail?: string; guestPhone?: string; company?: string;
  hostId: string; purpose: string; officeLocation: string;
  visitDate: string; lunchRequired: boolean; snacksRequired: boolean; meetingRoomId?: string;
}) {
  return prisma.visitorRequest.create({
    data: {
      ...data,
      officeLocation: data.officeLocation as never,
      visitDate: new Date(data.visitDate),
    },
  });
}

export async function updateStatus(id: string, status: VisitorStatus, userId: string) {
  const updates: Record<string, unknown> = { status };

  if (status === 'CHECKED_IN') {
    updates.checkInAt = new Date();
    // auto-generate QR
    updates.qrCode = nanoid(12);
  }
  if (status === 'CHECKED_OUT') updates.checkOutAt = new Date();

  const visitor = await prisma.visitorRequest.update({ where: { id }, data: updates });

  if (status === 'APPROVED') {
    const badgeNumber = `VB-${Date.now()}`;
    await prisma.visitorBadge.upsert({
      where: { visitorRequestId: id },
      create: { visitorRequestId: id, badgeNumber },
      update: {},
    });
  }

  return visitor;
}

export async function getTodayStats(officeLocation?: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const where: Record<string, unknown> = { visitDate: { gte: today, lt: tomorrow } };
  if (officeLocation) where.officeLocation = officeLocation;

  const [total, checkedIn, pending, approved] = await Promise.all([
    prisma.visitorRequest.count({ where }),
    prisma.visitorRequest.count({ where: { ...where, status: 'CHECKED_IN' } }),
    prisma.visitorRequest.count({ where: { ...where, status: 'PENDING' } }),
    prisma.visitorRequest.count({ where: { ...where, status: 'APPROVED' } }),
  ]);
  return { total, checkedIn, pending, approved };
}
