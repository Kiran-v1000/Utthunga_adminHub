import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const officeLocationSchema = z.enum(['BANGALORE', 'PUNE']);

export const visitorRequestSchema = z.object({
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  company: z.string().optional(),
  hostId: z.string().cuid(),
  purpose: z.string().min(5).max(500),
  officeLocation: officeLocationSchema,
  visitDate: z.string().datetime(),
  lunchRequired: z.boolean().default(false),
  snacksRequired: z.boolean().default(false),
  meetingRoomId: z.string().cuid().optional(),
});

export const travelRequestSchema = z.object({
  travelType: z.enum(['DOMESTIC', 'INTERNATIONAL']),
  origin: z.string().min(2),
  destination: z.string().min(2),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  purpose: z.string().min(10),
  costCenter: z.string().min(2),
  buId: z.string().cuid().optional(),
  accommodationRequired: z.boolean().default(false),
  advanceRequired: z.boolean().default(false),
  advanceAmount: z.number().positive().optional(),
});

export const grievanceSchema = z.object({
  category: z.enum(['FACILITY', 'SAFETY', 'HOUSEKEEPING', 'INFRASTRUCTURE', 'OTHER']),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  officeLocation: officeLocationSchema,
});

export const roomBookingSchema = z.object({
  roomId: z.string().cuid(),
  title: z.string().min(2).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  attendees: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const shipmentSchema = z.object({
  type: z.enum(['INBOUND', 'OUTBOUND']),
  senderName: z.string().min(2),
  senderAddress: z.string().min(5),
  receiverName: z.string().min(2),
  receiverAddress: z.string().min(5),
  officeLocation: officeLocationSchema,
  weight: z.number().positive().optional(),
  courierPartnerId: z.string().cuid().optional(),
  pickupDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});
