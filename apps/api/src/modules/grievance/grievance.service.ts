import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import { GRIEVANCE_SLA_HOURS } from '@adminhub/shared';
import type { GrievancePriority, GrievanceStatus } from '@prisma/client';
import { addHours } from 'date-fns';

function genTicketNumber() {
  return `GRV-${Date.now()}`;
}

export async function listTickets(query: {
  page?: number; limit?: number; status?: string; priority?: string;
  assignedToId?: string; submittedById?: string;
}) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assignedToId) where.assignedToId = query.assignedToId;
  if (query.submittedById) where.submittedById = query.submittedById;

  const [data, total] = await Promise.all([
    prisma.grievanceTicket.findMany({
      where, skip, take, orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.grievanceTicket.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function getTicket(id: string) {
  return prisma.grievanceTicket.findUniqueOrThrow({
    where: { id },
    include: {
      submittedBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      comments: { orderBy: { createdAt: 'asc' }, include: { ticket: false } },
    },
  });
}

export async function createTicket(userId: string, data: {
  category: string; priority: string; subject: string;
  description: string; officeLocation: string; attachments?: string[];
}) {
  const slaHours = GRIEVANCE_SLA_HOURS[data.priority] ?? 120;
  const dueAt = addHours(new Date(), slaHours);

  return prisma.grievanceTicket.create({
    data: {
      ticketNumber: genTicketNumber(),
      submittedById: userId,
      category: data.category as never,
      priority: data.priority as never,
      subject: data.subject,
      description: data.description,
      officeLocation: data.officeLocation as never,
      attachments: data.attachments ?? [],
      dueAt,
    },
  });
}

export async function updateTicket(id: string, updates: {
  status?: GrievanceStatus; assignedToId?: string; resolution?: string;
}) {
  const data: Record<string, unknown> = { ...updates };
  if (updates.status === 'RESOLVED') data.resolvedAt = new Date();
  return prisma.grievanceTicket.update({ where: { id }, data });
}

export async function addComment(ticketId: string, authorId: string, content: string, isInternal = false) {
  return prisma.grievanceComment.create({ data: { ticketId, authorId, content, isInternal } });
}

export async function checkSlaBreaches() {
  const breached = await prisma.grievanceTicket.findMany({
    where: {
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      slaBreached: false,
      dueAt: { lt: new Date() },
    },
    select: { id: true, submittedById: true, assignedToId: true },
  });

  for (const ticket of breached) {
    await prisma.grievanceTicket.update({ where: { id: ticket.id }, data: { slaBreached: true } });
  }
  return breached;
}
