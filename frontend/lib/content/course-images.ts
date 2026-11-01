/**
 * Canonical course cover images — single source for every course surface.
 *
 * Resolution order:
 * 1. Custom API media (non-official / non-generated uploads)
 * 2. Photography-led cover (category pool + stable hash for variety)
 * 3. Official local public asset keyed by source_id / slug (legacy generated)
 * 4. Branded default fallback
 *
 * Prefer real photography over generative abstract Pillow covers.
 * Manifest (legacy): backend/courses/data/course_image_manifest.json
 */

export const DEFAULT_COURSE_IMAGE = "/images/home/discipline-building-v2.jpg";

/** Shared photographic library used across catalogue surfaces. */
const PHOTO = {
  building: "/images/home/discipline-building-v2.jpg",
  buildingAlt: "/images/home/discipline-building.jpg",
  cad: "/images/home/discipline-cad-v2.jpg",
  cadAlt: "/images/home/discipline-cad.jpg",
  engineering: "/images/home/discipline-engineering-v2.jpg",
  engineeringAlt: "/images/home/discipline-engineering.jpg",
  electronics: "/images/home/discipline-electronics-v2.jpg",
  electronicsAlt: "/images/home/discipline-electronics.jpg",
  data: "/images/home/discipline-data-v2.jpg",
  dataAlt: "/images/home/discipline-data.jpg",
  creative: "/images/home/discipline-creative-v2.jpg",
  creativeAlt: "/images/home/discipline-creative.jpg",
  ict: "/images/home/discipline-ict-v2.jpg",
  nairobi: "/images/home/nairobi.jpg",
  hero: "/images/home/hero-lab-pcb-v4.jpg",
  blogBim: "/images/home/blog-bim.jpg",
} as const;

/**
 * Photography pools by official Phase 3 category slug.
 * Multiple photos per category → stable hash picks one per course.
 */
export const CATEGORY_PHOTO_POOLS: Record<string, readonly string[]> = {
  "mep-building-services": [
    PHOTO.building,
    PHOTO.buildingAlt,
    PHOTO.engineering,
    PHOTO.electronics,
  ],
  "architecture-bim-digital-construction": [
    PHOTO.cad,
    PHOTO.cadAlt,
    PHOTO.blogBim,
    PHOTO.creative,
  ],
  "quantity-surveying-cost-management": [
    PHOTO.engineering,
    PHOTO.engineeringAlt,
    PHOTO.data,
    PHOTO.building,
  ],
  "project-management-infrastructure": [
    PHOTO.nairobi,
    PHOTO.building,
    PHOTO.engineering,
    PHOTO.ict,
  ],
  "industrial-engineering-automation": [
    PHOTO.electronics,
    PHOTO.electronicsAlt,
    PHOTO.hero,
    PHOTO.engineering,
  ],
  "renewable-energy-sustainability": [
    PHOTO.engineering,
    PHOTO.engineeringAlt,
    PHOTO.nairobi,
    PHOTO.building,
  ],
  "engineering-finance-investment": [
    PHOTO.data,
    PHOTO.dataAlt,
    PHOTO.ict,
    PHOTO.creative,
  ],
  "corporate-strategy-leadership": [
    PHOTO.creative,
    PHOTO.creativeAlt,
    PHOTO.data,
    PHOTO.ict,
  ],
};

/** Primary photo per category (discovery tiles / fallbacks). */
export const CATEGORY_PHOTO_COVERS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_PHOTO_POOLS).map(([slug, pool]) => [slug, pool[0]]),
);

/** @deprecated alias */
export const CATEGORY_IMAGES = CATEGORY_PHOTO_COVERS;

export type CourseImageInput = {
  sourceId?: string | null;
  slug?: string | null;
  title?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  apiImageUrl?: string | null;
};

/** Official public path from stable source_id (or slug fallback). */
export function officialPublicPath(sourceIdOrSlug: string): string {
  return `/images/courses/official/${sourceIdOrSlug}.webp`;
}

function isGeneratedOfficialAsset(url: string): boolean {
  return (
    url.includes("/media/course_thumbnails/official/") ||
    url.includes("/images/courses/official/")
  );
}

/** FNV-1a style hash for stable per-course photo selection. */
function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickFromPool(pool: readonly string[], key: string): string {
  if (pool.length === 1) return pool[0];
  return pool[stableHash(key) % pool.length];
}

function categoryPhoto(
  categorySlug?: string | null,
  seed?: string | null,
): string | null {
  const cat = (categorySlug || "").trim();
  if (!cat) return null;
  const pool = CATEGORY_PHOTO_POOLS[cat];
  if (!pool?.length) return CATEGORY_PHOTO_COVERS[cat] || null;
  if (seed) return pickFromPool(pool, `${cat}::${seed}`);
  return pool[0];
}

/**
 * Resolve the single cover URL for a course.
 * Prefer real photography over generative abstract covers.
 * Seeded by slug/sourceId so cards in the same category still vary.
 */
export function resolveCourseImage(input: CourseImageInput): string {
  const api = input.apiImageUrl?.trim() || "";
  const seed = (input.slug || input.sourceId || input.title || "").trim();
  const photo = categoryPhoto(input.categorySlug, seed || null);

  // Real custom uploads (instructor/admin) win.
  if (api && !isGeneratedOfficialAsset(api)) return api;

  // Photography-led category cover with within-category variety.
  if (photo) return photo;

  const sourceId = (input.sourceId || "").trim();
  if (sourceId) return officialPublicPath(sourceId);

  if (api) return api;

  const slug = (input.slug || "").trim();
  if (slug) return officialPublicPath(slug);

  return DEFAULT_COURSE_IMAGE;
}

/** Descriptive alt text for course covers. */
export function courseImageAlt(input: CourseImageInput): string {
  const title = (input.title || "Course").trim();
  const cat = (input.categoryName || "").trim();
  if (cat) return `${title} — ${cat} programme at CAITECH`;
  return `${title} — CAITECH technical programme`;
}

/** Category tile image for discovery grids. */
export function resolveCategoryImage(categorySlug: string): string {
  return categoryPhoto(categorySlug) || DEFAULT_COURSE_IMAGE;
}
