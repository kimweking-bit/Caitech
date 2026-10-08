/**
 * Verified: backend/courses/serializers.VersionedCourseSerializer
 * + VersionedCategorySerializer + CourseApiPagination (page_size=12)
 */

export type ApiErrorBody = {
  detail?: string;
  code?: string;
  [key: string]: unknown;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type CourseSection = {
  id: number;
  title: string;
  order: number;
};

export type CourseLesson = {
  id: number;
  title: string;
  order: number;
  duration_minutes?: number | null;
  is_preview?: boolean;
  section?: number | null;
};

/** GET /api/v1/courses/ and /api/v1/courses/{slug}/ */
export type CourseListItem = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  learning_outcomes: string;
  image: string | null;
  category: number | null;
  category_name: string | null;
  instructor: number | null;
  instructor_username: string | null;
  price: string;
  original_price: string | null;
  currency: string;
  seat_capacity: number | null;
  level: string;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  sections: CourseSection[];
  lessons: CourseLesson[];
  average_rating: number | null;
  review_count: number;
  enrolled_count: number;
  percent_booked: number | null;
  total_duration_hours: number;
  is_available: boolean;
  course_type: string;
  duration: string;
  delivery_modes: string[];
  intake_status: string;
  whatsapp_inquiry_url: string;
};

export type CourseDetail = CourseListItem;

export type CourseListParams = {
  page?: number;
  search?: string;
  category?: string;
  ordering?: string;
};

export type CourseCardModel = {
  id: number;
  slug: string;
  href: string;
  title: string;
  description: string;
  imageUrl: string | null;
  categoryLabel: string | null;
  level: string | null;
  durationLabel: string | null;
  priceLabel: string | null;
  originalPriceLabel: string | null;
  isFree: boolean;
  isAvailable: boolean;
  rating: number | null;
  reviewCount: number;
};
