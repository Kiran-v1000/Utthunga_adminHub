import type { PaginationMeta } from '@adminhub/shared';

export function getPaginationParams(page = 1, limit = 20) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;
  return { skip, take: safeLimit, page: safePage, limit: safeLimit };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function ok<T>(data: T, meta?: PaginationMeta) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function fail(error: string, status = 400) {
  return { success: false, error, status };
}
