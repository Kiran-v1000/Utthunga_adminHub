import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import type { TravelStatus } from '@prisma/client';

function genRequestNumber() {
  return `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function listTravelRequests(query: {
  page?: number; limit?: number; status?: string; userId?: string; buId?: string;
}) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  if (query.buId) where.buId = query.buId;

  const [data, total] = await Promise.all([
    prisma.travelRequest.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        bu: { select: { id: true, name: true } },
        bookings: true,
      },
    }),
    prisma.travelRequest.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function getTravelRequest(id: string) {
  return prisma.travelRequest.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      bu: true, bookings: true, documents: true,
    },
  });
}

export async function createTravelRequest(userId: string, data: {
  travelType: string; origin: string; destination: string;
  departureDate: string; returnDate: string; purpose: string;
  costCenter: string; buId?: string; accommodationRequired: boolean;
  advanceRequired: boolean; advanceAmount?: number;
}) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return prisma.travelRequest.create({
    data: {
      requestNumber: genRequestNumber(),
      userId,
      managerId: user.managerId,
      ...data,
      travelType: data.travelType as never,
      departureDate: new Date(data.departureDate),
      returnDate: new Date(data.returnDate),
      status: 'MANAGER_APPROVAL',
    },
  });
}

export async function updateTravelStatus(id: string, status: TravelStatus, actorId: string, reason?: string) {
  const updates: Record<string, unknown> = { status };
  if (status === 'BU_HEAD_APPROVAL') updates.managerApprovedAt = new Date();
  if (status === 'ADMIN_PROCESSING') updates.buHeadApprovedAt = new Date();
  if (reason) updates.rejectionReason = reason;

  return prisma.travelRequest.update({ where: { id }, data: updates });
}

export async function getTravelStats() {
  const [pending, approved, total] = await Promise.all([
    prisma.travelRequest.count({ where: { status: { in: ['MANAGER_APPROVAL', 'BU_HEAD_APPROVAL'] } } }),
    prisma.travelRequest.count({ where: { status: 'BOOKED' } }),
    prisma.travelRequest.count(),
  ]);
  return { pending, approved, total };
}
