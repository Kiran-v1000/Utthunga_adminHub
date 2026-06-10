import { prisma } from '@/config/db';
import { getPaginationParams, buildMeta } from '@/shared/pagination';
import type { ShipmentStatus } from '@prisma/client';

function genRequestNumber() {
  return `SHP-${Date.now()}`;
}

export async function list(query: { page?: number; limit?: number; status?: string; type?: string }) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;

  const [data, total] = await Promise.all([
    prisma.shipmentRequest.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, name: true } },
        courierPartner: true,
        tracking: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.shipmentRequest.count({ where }),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function get(id: string) {
  return prisma.shipmentRequest.findUniqueOrThrow({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      courierPartner: true,
      tracking: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function create(requesterId: string, data: {
  type: string; senderName: string; senderAddress: string;
  receiverName: string; receiverAddress: string; officeLocation: string;
  weight?: number; courierPartnerId?: string; pickupDate?: string; notes?: string;
}) {
  return prisma.shipmentRequest.create({
    data: {
      requestNumber: genRequestNumber(),
      requesterId,
      type: data.type as never,
      senderName: data.senderName,
      senderAddress: data.senderAddress,
      receiverName: data.receiverName,
      receiverAddress: data.receiverAddress,
      officeLocation: data.officeLocation as never,
      weight: data.weight,
      courierPartnerId: data.courierPartnerId,
      pickupDate: data.pickupDate ? new Date(data.pickupDate) : undefined,
      notes: data.notes,
    },
  });
}

export async function updateStatus(id: string, status: ShipmentStatus, updatedBy: string, location?: string, notes?: string) {
  const [shipment] = await Promise.all([
    prisma.shipmentRequest.update({ where: { id }, data: { status } }),
    prisma.shipmentTracking.create({ data: { shipmentRequestId: id, status, location, notes, updatedBy } }),
  ]);
  return shipment;
}
