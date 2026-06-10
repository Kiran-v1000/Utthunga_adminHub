import type { Role, OfficeLocation } from './constants';

// ─── API Response ──────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  officeLocation: OfficeLocation;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  officeLocation: OfficeLocation;
  employeeId?: string;
  department?: string;
  designation?: string;
  buId?: string;
  avatar?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Notification ─────────────────────────────────────────────────
export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}

// ─── File Upload ─────────────────────────────────────────────────
export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

// ─── Socket Events ────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  VISITOR_CHECKIN: 'visitor:checkin',
  VISITOR_CHECKOUT: 'visitor:checkout',
  NOTIFICATION_NEW: 'notification:new',
  GRIEVANCE_UPDATED: 'grievance:updated',
  TRAVEL_STATUS_CHANGED: 'travel:statusChanged',
  SHIPMENT_UPDATED: 'shipment:updated',
} as const;
