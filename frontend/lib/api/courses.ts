import { apiFetch } from "@/lib/api/client";
import type {
  CourseCardModel,
  CourseListItemWire,
  Paginated,
} from "@/types/api";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function formatPrice(
  price: string | number | null | undefined,
  currency?: string | null,
): string | undefined {
  if (price === null || price === undefined || price === "") return undefined;
  const num = typeof price === "number" ? price : Number(price);
  if (Number.isFinite(num)) {
    const cur = (currency || "KES").toUpperCase();
    try {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: cur === "KES" ? "KES" : cur,
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `${cur} ${num.toLocaleString("en-KE")}`;
    }
  }
  return String(price);
}

/** Map DRF wire → card view-model. Safe with missing optional fields. */
export function mapCourseToCard(wire: CourseListItemWire): CourseCardModel {
  const category =
    typeof wire.category === "string"
      ? wire.category
      : pickString(wire.category?.name);

  const durationLabel = pickString(
    wire.duration_label,
    wire.duration,
    wire.duration_hours != null ? `${wire.duration_hours} hours` : undefined,
  );

  const imageUrl = pickString(
    wire.thumbnail,
    wire.cover_image,
    wire.image,
  );

  const tools = wire.tools ?? wire.software ?? undefined;

  return {
    slug: wire.slug,
    title: wire.title,
    categoryLabel: category,
    level: pickString(wire.level),
    durationLabel,
    deliveryMode: pickString(wire.delivery_mode),
    priceLabel: formatPrice(wire.price, wire.currency),
    imageUrl,
    href: `/courses/${wire.slug}`,
    tools: Array.isArray(tools)
      ? tools.filter((t): t is string => typeof t === "string")
      : undefined,
  };
}

function unwrapList(data: unknown): CourseListItemWire[] {
  if (Array.isArray(data)) return data as CourseListItemWire[];
  const rec = asRecord(data);
  if (rec && Array.isArray(rec.results)) {
    return rec.results as CourseListItemWire[];
  }
  return [];
}

/**
 * Featured courses for homepage.
 * Tries `?featured=true` then falls back to first page of catalog.
 * Returns [] on any failure — homepage must not crash.
 */
export async function getFeaturedCourses(
  limit = 6,
): Promise<CourseCardModel[]> {
  try {
    const featured = await apiFetch<Paginated<CourseListItemWire> | CourseListItemWire[]>(
      `/courses/?featured=true&page_size=${limit}`,
      {
        next: { revalidate: 300, tags: ["courses", "featured"] },
      },
    );
    const list = unwrapList(featured).slice(0, limit);
    if (list.length > 0) return list.map(mapCourseToCard);
  } catch {
    // featured filter may not exist — fall through
  }

  try {
    const page = await apiFetch<Paginated<CourseListItemWire> | CourseListItemWire[]>(
      `/courses/?page_size=${limit}`,
      {
        next: { revalidate: 300, tags: ["courses"] },
      },
    );
    return unwrapList(page).slice(0, limit).map(mapCourseToCard);
  } catch {
    return [];
  }
}
