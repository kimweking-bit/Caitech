import { apiFetch, ApiError } from "@/lib/api/client";
import { formatMoney, mediaUrl } from "@/lib/utils/format";
import type {
  Category,
  CourseCardModel,
  CourseDetail,
  CourseListItem,
  CourseListParams,
  PaginatedResponse,
} from "@/types/api";

export type { CourseCardModel, CourseDetail, CourseListItem, Category };

function qs(params?: CourseListParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.search?.trim()) sp.set("search", params.search.trim());
  if (params.category && params.category !== "all") {
    sp.set("category", params.category);
  }
  if (params.ordering) sp.set("ordering", params.ordering);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function getCourses(
  params?: CourseListParams,
): Promise<PaginatedResponse<CourseListItem>> {
  return apiFetch<PaginatedResponse<CourseListItem>>(`/courses/${qs(params)}`, {
    next: { revalidate: 60, tags: ["courses"] },
  });
}

export async function getCourseBySlug(
  slug: string,
): Promise<CourseDetail | null> {
  try {
    return await apiFetch<CourseDetail>(
      `/courses/${encodeURIComponent(slug)}/`,
      {
        next: { revalidate: 60, tags: ["courses", `course-${slug}`] },
      },
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await apiFetch<Category[] | PaginatedResponse<Category>>(
      "/categories/",
      { next: { revalidate: 300, tags: ["categories"] } },
    );
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as PaginatedResponse<Category>).results)) {
      return (data as PaginatedResponse<Category>).results;
    }
    return [];
  } catch {
    return [];
  }
}

export async function getFeaturedCourses(
  limit = 3,
): Promise<CourseListItem[]> {
  try {
    const page = await getCourses({ page: 1, ordering: "-created_at" });
    return page.results.slice(0, limit);
  } catch {
    return [];
  }
}

function durationLabel(c: CourseListItem): string | null {
  if (c.duration?.trim()) return c.duration.trim();
  if (c.total_duration_hours > 0) {
    const h = c.total_duration_hours;
    return h === 1 ? "1 hour" : `${h} hours`;
  }
  return null;
}

export function toCourseCard(c: CourseListItem): CourseCardModel {
  const currency = c.currency || "KES";
  const blurb = c.short_description || c.description || "";
  return {
    id: c.id,
    slug: c.slug,
    href: `/courses/${c.slug}`,
    title: c.title,
    description: blurb,
    imageUrl: mediaUrl(c.image),
    categoryLabel: c.category_name || null,
    level: c.level || null,
    durationLabel: durationLabel(c),
    priceLabel: c.is_free ? "Free" : formatMoney(c.price, currency),
    originalPriceLabel:
      !c.is_free && c.original_price
        ? formatMoney(c.original_price, currency)
        : null,
    isFree: Boolean(c.is_free),
    isAvailable: Boolean(c.is_available),
    rating:
      c.review_count > 0 && c.average_rating != null ? c.average_rating : null,
    reviewCount: c.review_count ?? 0,
  };
}
