import { PaginationMeta } from '../types/domain';

export interface ResolvedPagination {
  page: number;
  pageSize: number;
  offset: number;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export function resolvePagination(page?: number, pageSize?: number): ResolvedPagination {
  const resolvedPage = Math.max(1, page ?? 1);
  const resolvedPageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    page: resolvedPage,
    pageSize: resolvedPageSize,
    offset: (resolvedPage - 1) * resolvedPageSize,
  };
}

export function buildPaginationMeta(page: number, pageSize: number, totalItems: number): PaginationMeta {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}
