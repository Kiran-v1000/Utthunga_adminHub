import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/rbac';
import { prisma } from '@/config/db';
import { ok } from '@/shared/pagination';
import { z } from 'zod';

const router = Router();
router.use(authenticateToken);
router.use(authorizeRoles('SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','FINANCE_TEAM','REPORTING_MANAGER','BU_HEAD'));

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  officeLocation: z.string().optional(),
});

router.get('/visitors', async (req, res) => {
  const { startDate, endDate, officeLocation } = dateRangeSchema.parse(req.query);
  const where: Record<string, unknown> = {};
  if (officeLocation) where.officeLocation = officeLocation;
  if (startDate || endDate) {
    where.visitDate = {};
    if (startDate) (where.visitDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.visitDate as Record<string, unknown>).lte = new Date(endDate);
  }
  const data = await prisma.visitorRequest.findMany({
    where,
    include: { host: { select: { name: true, department: true } } },
    orderBy: { visitDate: 'desc' },
  });
  res.json(ok(data));
});

router.get('/travel', async (req, res) => {
  const { startDate, endDate, officeLocation } = dateRangeSchema.parse(req.query);
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
  }
  const data = await prisma.travelRequest.findMany({
    where,
    include: { user: { select: { name: true, department: true } }, bu: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(ok(data));
});

router.get('/grievance-sla', async (_req, res) => {
  const tickets = await prisma.grievanceTicket.findMany({
    select: { priority: true, status: true, slaBreached: true, dueAt: true, resolvedAt: true, createdAt: true },
  });
  const summary = {
    total: tickets.length,
    breached: tickets.filter((t) => t.slaBreached).length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    open: tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
    byPriority: {
      CRITICAL: tickets.filter((t) => t.priority === 'CRITICAL').length,
      HIGH: tickets.filter((t) => t.priority === 'HIGH').length,
      MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
      LOW: tickets.filter((t) => t.priority === 'LOW').length,
    },
  };
  res.json(ok({ tickets, summary }));
});

router.get('/assets', async (req, res) => {
  const { officeLocation } = dateRangeSchema.parse(req.query);
  const where: Record<string, unknown> = {};
  if (officeLocation) where.officeLocation = officeLocation;
  const data = await prisma.asset.findMany({
    where,
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(ok(data));
});

router.get('/inventory', async (req, res) => {
  const { officeLocation } = dateRangeSchema.parse(req.query);
  const where: Record<string, unknown> = {};
  if (officeLocation) where.officeLocation = officeLocation;
  const data = await prisma.inventoryItem.findMany({ where, orderBy: { name: 'asc' } });
  res.json(ok(data));
});

router.get('/visa-expiry', async (_req, res) => {
  const next90 = new Date(Date.now() + 90 * 86400000);
  const data = await prisma.visaRecord.findMany({
    where: { isActive: true, expiryDate: { lte: next90 } },
    include: { user: { select: { name: true, email: true, employeeId: true } } },
    orderBy: { expiryDate: 'asc' },
  });
  res.json(ok(data));
});

router.get('/room-utilization', async (req, res) => {
  const { startDate, endDate, officeLocation } = dateRangeSchema.parse(req.query);
  const where: Record<string, unknown> = { status: 'CONFIRMED' };
  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) (where.startTime as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.startTime as Record<string, unknown>).lte = new Date(endDate);
  }
  const data = await prisma.roomBooking.findMany({
    where,
    include: { room: { select: { name: true, type: true, capacity: true, officeLocation: true } } },
    orderBy: { startTime: 'desc' },
  });
  res.json(ok(data));
});

export default router;
