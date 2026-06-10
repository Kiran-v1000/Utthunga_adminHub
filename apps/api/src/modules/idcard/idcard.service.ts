import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import type { IDCardStatus, EmployeeType } from '@prisma/client';

export async function list(query: { page?: number; limit?: number; status?: string; employeeType?: string }) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.employeeType) where.employeeType = query.employeeType;

  const [data, total] = await Promise.all([
    prisma.iDCard.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, employeeId: true, officeLocation: true } } },
    }),
    prisma.iDCard.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function get(id: string) {
  return prisma.iDCard.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, employeeId: true, designation: true } },
      requests: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function createForEmployee(userId: string, employeeType: EmployeeType) {
  return prisma.iDCard.upsert({
    where: { id: userId },
    create: { userId, employeeType, status: 'ADMIN_NOTIFIED' },
    update: { status: 'ADMIN_NOTIFIED', employeeType },
  });
}

export async function updateStatus(id: string, status: IDCardStatus, actorId: string) {
  const updates: Record<string, unknown> = { status };
  if (status === 'PRINTED') { updates.printedAt = new Date(); updates.printedBy = actorId; }
  if (status === 'ISSUED') updates.issuedAt = new Date();
  if (status === 'DEACTIVATED') updates.collectedAt = new Date();

  return prisma.iDCard.update({ where: { id }, data: updates });
}

export async function handleExit(userId: string) {
  const card = await prisma.iDCard.findFirst({ where: { userId, status: 'ISSUED' } });
  if (card) {
    await prisma.iDCard.update({ where: { id: card.id }, data: { status: 'DEACTIVATED', collectedAt: new Date() } });
  }
  return prisma.exitRecord.upsert({
    where: { userId },
    create: { userId, exitDate: new Date() },
    update: { exitDate: new Date(), idCardCollected: !!card, clearanceStatus: 'IN_PROGRESS' },
  });
}
