import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';

function genAssetId() {
  return `AST-${Date.now()}`;
}

export async function list(query: { page?: number; limit?: number; status?: string; officeLocation?: string; category?: string }) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.officeLocation) where.officeLocation = query.officeLocation;
  if (query.category) where.category = query.category;

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.asset.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function get(id: string) {
  return prisma.asset.findUniqueOrThrow({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      maintenanceRecords: { orderBy: { scheduledAt: 'desc' } },
      transfers: { orderBy: { transferredAt: 'desc' } },
      disposals: true,
    },
  });
}

export async function create(data: {
  name: string; category: string; serialNumber?: string; brand?: string;
  model?: string; purchaseDate?: string; purchaseCost?: number;
  depreciationMethod?: string; warrantyExpiry?: string;
  officeLocation: string; ownerId?: string; costCenter?: string; glCode?: string; notes?: string;
}) {
  return prisma.asset.create({
    data: {
      assetId: genAssetId(),
      name: data.name, category: data.category,
      serialNumber: data.serialNumber, brand: data.brand, model: data.model,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      purchaseCost: data.purchaseCost,
      currentValue: data.purchaseCost,
      depreciationMethod: data.depreciationMethod as never,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      officeLocation: data.officeLocation as never,
      ownerId: data.ownerId,
      costCenter: data.costCenter, glCode: data.glCode, notes: data.notes,
    },
  });
}

export async function transferAsset(id: string, toOwnerId: string, toLocation: string, reason: string, approvedBy: string) {
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id } });

  const [updated] = await Promise.all([
    prisma.asset.update({
      where: { id },
      data: { ownerId: toOwnerId, officeLocation: toLocation as never, status: 'ACTIVE' },
    }),
    prisma.assetTransfer.create({
      data: {
        assetId: id,
        fromLocation: asset.officeLocation,
        toLocation,
        fromOwnerId: asset.ownerId ?? undefined,
        toOwnerId,
        reason,
        transferredAt: new Date(),
        approvedBy,
      },
    }),
  ]);
  return updated;
}
