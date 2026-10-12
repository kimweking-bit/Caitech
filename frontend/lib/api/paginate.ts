import type { PaginatedResponse } from "@/types/api";

/** Collect up to `maxPages` of a paginated list endpoint. */
export async function collectPages<T>(
  fetchPage: (
    page: number,
  ) => Promise<PaginatedResponse<T> | T[]>,
  maxPages = 8,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetchPage(page);
    if (Array.isArray(res)) {
      out.push(...res);
      break;
    }
    const batch = res.results || [];
    out.push(...batch);
    if (!res.next || batch.length === 0) break;
  }
  return out;
}
