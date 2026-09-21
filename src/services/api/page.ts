export type SerializedPage = {
  last?: boolean;
  totalPages?: number;
  number?: number;
  page?: { number?: number; totalPages?: number };
};

/** Supports the legacy Spring Page JSON and Spring Data's stable VIA_DTO shape. */
export function isLastPage(page: SerializedPage): boolean {
  if (typeof page.last === 'boolean') return page.last;
  const number = page.page?.number ?? page.number ?? 0;
  const totalPages = page.page?.totalPages ?? page.totalPages ?? 1;
  return number >= Math.max(totalPages - 1, 0);
}

export function totalPageCount(page: SerializedPage): number {
  return page.page?.totalPages ?? page.totalPages ?? 1;
}
