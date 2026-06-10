import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';

export async function listRooms(officeLocation?: string) {
  return prisma.room.findMany({
    where: { isActive: true, ...(officeLocation ? { officeLocation: officeLocation as never } : {}) },
    orderBy: { name: 'asc' },
  });
}

export async function checkConflict(roomId: string, startTime: Date, endTime: Date, excludeId?: string) {
  const conflict = await prisma.roomBooking.findFirst({
    where: {
      roomId,
      status: 'CONFIRMED',
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        { startTime: { lte: endTime }, endTime: { gte: startTime } },
      ],
    },
  });
  return !!conflict;
}

export async function createBooking(userId: string, data: {
  roomId: string; title: string; startTime: string; endTime: string;
  attendees?: number; notes?: string;
}) {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  if (start >= end) throw Object.assign(new Error('End time must be after start time'), { status: 400 });
  if (await checkConflict(data.roomId, start, end)) {
    throw Object.assign(new Error('Room is already booked for this time slot'), { status: 409 });
  }

  return prisma.roomBooking.create({
    data: {
      roomId: data.roomId, bookedById: userId,
      title: data.title, startTime: start, endTime: end,
      attendees: data.attendees, notes: data.notes,
    },
    include: { room: true, bookedBy: { select: { id: true, name: true } } },
  });
}

export async function listBookings(query: {
  page?: number; limit?: number; roomId?: string;
  startDate?: string; endDate?: string; userId?: string;
}) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.roomId) where.roomId = query.roomId;
  if (query.userId) where.bookedById = query.userId;
  if (query.startDate || query.endDate) {
    where.startTime = {};
    if (query.startDate) (where.startTime as Record<string, unknown>).gte = new Date(query.startDate);
    if (query.endDate) (where.startTime as Record<string, unknown>).lte = new Date(query.endDate);
  }
  const [data, total] = await Promise.all([
    prisma.roomBooking.findMany({
      where, skip, take, orderBy: { startTime: 'asc' },
      include: { room: true, bookedBy: { select: { id: true, name: true } } },
    }),
    prisma.roomBooking.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function cancelBooking(id: string, userId: string) {
  const booking = await prisma.roomBooking.findUniqueOrThrow({ where: { id } });
  if (booking.bookedById !== userId) {
    throw Object.assign(new Error('Cannot cancel another user\'s booking'), { status: 403 });
  }
  return prisma.roomBooking.update({ where: { id }, data: { status: 'CANCELLED' } });
}
