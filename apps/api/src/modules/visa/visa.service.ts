import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import { differenceInDays } from 'date-fns';

export async function listVisaRecords(query: { page?: number; limit?: number; userId?: string; expiringSoon?: boolean }) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = { isActive: true };
  if (query.userId) where.userId = query.userId;
  if (query.expiringSoon) {
    const threshold = new Date(Date.now() + 90 * 86400000);
    where.expiryDate = { lte: threshold, gte: new Date() };
  }

  const [data, total] = await Promise.all([
    prisma.visaRecord.findMany({
      where, skip, take, orderBy: { expiryDate: 'asc' },
      include: { user: { select: { id: true, name: true, email: true, employeeId: true } } },
    }),
    prisma.visaRecord.count({ where }),
  ]);

  const enriched = data.map((v) => ({
    ...v,
    daysUntilExpiry: differenceInDays(new Date(v.expiryDate), new Date()),
  }));

  return { data: enriched, meta: buildMeta(total, page, limit) };
}

export async function getVisaRecord(id: string) {
  return prisma.visaRecord.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      requests: true, alerts: true,
    },
  });
}

export async function createVisaRecord(userId: string, data: {
  visaNumber: string; country: string; visaType: string;
  issueDate: string; expiryDate: string; passportNumber: string; documentUrls?: string[];
}) {
  return prisma.visaRecord.create({
    data: {
      userId,
      ...data,
      issueDate: new Date(data.issueDate),
      expiryDate: new Date(data.expiryDate),
      documentUrls: data.documentUrls ?? [],
    },
  });
}

export async function getExpiryAlertCandidates() {
  const thresholds = [180, 90, 30];
  const results = [];
  for (const days of thresholds) {
    const target = new Date(Date.now() + days * 86400000);
    const dayStart = new Date(target); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(target); dayEnd.setHours(23, 59, 59, 999);

    const visas = await prisma.visaRecord.findMany({
      where: { isActive: true, expiryDate: { gte: dayStart, lte: dayEnd } },
      include: { user: true, alerts: true },
    });

    for (const visa of visas) {
      const alertType = `${days}_DAYS`;
      const alreadySent = visa.alerts.some((a) => a.alertType === alertType && a.sentAt);
      if (!alreadySent) results.push({ visa, days, alertType });
    }
  }
  return results;
}
