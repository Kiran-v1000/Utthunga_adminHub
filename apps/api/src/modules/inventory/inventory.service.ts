import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import { notifyUser } from '@/notifications/notification.service';

export async function list(query: { page?: number; limit?: number; category?: string; officeLocation?: string; lowStock?: boolean }) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = { isActive: true };
  if (query.category) where.category = query.category;
  if (query.officeLocation) where.officeLocation = query.officeLocation;

  const [data, total] = await Promise.all([
    prisma.inventoryItem.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    prisma.inventoryItem.count({ where }),
  ]);

  const enriched = data.map((i) => ({ ...i, isLowStock: i.quantity <= i.reorderLevel }));
  const filtered = query.lowStock ? enriched.filter((i) => i.isLowStock) : enriched;

  return { data: filtered, meta: buildMeta(total, page, limit) };
}

export async function adjustStock(itemId: string, delta: number, type: string, reason: string, performedBy: string) {
  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
  const newQty = item.quantity + delta;
  if (newQty < 0) throw Object.assign(new Error('Insufficient stock'), { status: 400 });

  const [updated] = await Promise.all([
    prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity: newQty } }),
    prisma.stockTransaction.create({
      data: { inventoryItemId: itemId, type, quantity: Math.abs(delta), reason, performedBy },
    }),
  ]);

  if (newQty <= item.reorderLevel) {
    await prisma.reorderAlert.upsert({
      where: { id: `${itemId}-pending` },
      create: {
        id: `${itemId}-pending`,
        inventoryItemId: itemId,
        currentQuantity: newQty,
        reorderLevel: item.reorderLevel,
      },
      update: { currentQuantity: newQty, sentAt: new Date(), resolvedAt: null, status: 'PENDING' },
    }).catch(() => prisma.reorderAlert.create({
      data: { inventoryItemId: itemId, currentQuantity: newQty, reorderLevel: item.reorderLevel },
    }));
  }

  return updated;
}

export async function getLowStockAlerts(officeLocation?: string) {
  const where: Record<string, unknown> = { status: 'PENDING' };
  return prisma.reorderAlert.findMany({
    where,
    include: { inventoryItem: true },
    orderBy: { sentAt: 'desc' },
  });
}
