/**
 * Provisional API types for Phase 1 shell.
 * Source of truth will be OpenAPI (/api/v1/schema/) once regenerated.
 * Prefer optional fields; never assume featured flags without backend confirmation.
 */

export type ApiErrorBody = {
  detail?: string;
  [field: string]: unknown;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/** Wire shape guesses — all optional until contract verified. */
export type CourseListItemWire = {
  id?: number | string;
  slug: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  image?: string | null;
  cover_image?: string | null;
  category?:
    | string
    | {
        id?: number | string;
        name?: string;
        slug?: string;
      }
    | null;
  level?: string | null;
  duration?: string | null;
  duration_hours?: number | null;
  duration_label?: string | null;
  delivery_mode?: string | null;
  price?: string | number | null;
  currency?: string | null;
  is_featured?: boolean;
  featured?: boolean;
  enrollment_open?: boolean;
  tools?: string[] | null;
  software?: string[] | null;
};

export type CategoryWire = {
  id?: number | string;
  name: string;
  slug: string;
  description?: string | null;
  course_count?: number | null;
};

export type BlogPostListItemWire = {
  id?: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  published_at?: string | null;
  cover_image?: string | null;
};

/** View-model used by CourseCard — mapped from wire, never invented. */
export type CourseCardModel = {
  slug: string;
  title: string;
  categoryLabel?: string;
  level?: string;
  durationLabel?: string;
  deliveryMode?: string;
  priceLabel?: string;
  imageUrl?: string;
  href: string;
  tools?: string[];
};
