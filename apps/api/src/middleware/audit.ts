import type { Request } from 'express';
import { prisma } from '@/config/db';

interface AuditOptions {
  action: string;
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export async function auditLog(req: Request, opts: AuditOptions) {
  if (!req.user) return;
  await prisma.auditLog.create({
    data: {
      userId: req.user.userId,
      action: opts.action,
      entity: opts.entity,
      entityId: opts.entityId,
      oldValues: opts.oldValues as never,
      newValues: opts.newValues as never,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  }).catch((err) => console.error('Audit log failed:', err));
}
