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


/* ---- Auth (accounts serializers) ---- */

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_student: boolean;
  is_instructor: boolean;
  is_verified_instructor: boolean;
  is_staff: boolean;
  bio: string;
  profile_picture: string | null;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

/* ---- Commerce (payments serializers) ---- */

export type CartLine = {
  course_id: number;
  title: string;
  slug: string;
  image: string | null;
  currency: string;
  unit_price: string;
  original_price: string | null;
};

export type Cart = {
  items: CartLine[];
  currency: string;
  subtotal: string;
  discount_amount: string;
  fee_amount: string;
  total: string;
  coupon_code: string;
};

export type CheckoutPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
};

export type OrderItem = {
  course_title: string;
  unit_price: string;
  currency: string;
  quantity: number;
};

export type PaymentTransaction = {
  reference: string;
  provider: string;
  status: string;
  amount: string;
  currency: string;
  redirect_url: string | null;
};

export type Order = {
  reference: string;
  status: string;
  currency: string;
  subtotal: string;
  discount_amount: string;
  fee_amount: string;
  total: string;
  expires_at: string | null;
  coupon_code: string;
  items: OrderItem[];
  latest_transaction: PaymentTransaction | null;
  created_at: string;
  updated_at: string;
};

export type PaymentMethod = "mpesa" | "card" | "paypal";

export type PaymentInitiation = {
  order_reference: string;
  order_status: string;
  transaction_reference: string;
  provider: string;
  payment_status: string;
  redirect_url: string | null;
  message?: string;
};
