export const ADMIN_PAGE_SIZE = 10;

export function paginateSlice<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function pageRangeEnd(page: number, pageSize: number, total: number): number {
  return Math.min(page * pageSize, total);
}
