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
  lessons?: CourseLesson[];
};

export type CourseLesson = {
  id: number;
  title: string;
  order: number;
  content?: string | null;
  duration_minutes?: number | null;
  is_preview?: boolean;
  section?: number | null;
  video_url?: string | null;
};

/** GET /api/v1/courses/ and /api/v1/courses/{slug}/ */
export type CourseListItem = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  learning_outcomes: string | string[];
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


/* ---- Site content ---- */

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featured_image: string | null;
  published_at: string | null;
  status: string;
  categories: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  course?: number | null;
  website?: string;
};

export type ContactAccepted = { detail: string };

export type NewsletterSubscribe = { email: string };

/* ---- AI learning path ---- */

export type LearningPathPayload = {
  goals: string;
  current_skill_level: "beginner" | "intermediate" | "advanced";
  interests: string;
  hours_per_week: number;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
};

export type LearningPathRecommendation = {
  course_id: number;
  title: string;
  slug: string;
  course_type: string;
  duration: string;
  delivery_modes: string[];
  intake_status: string;
  reason: string;
};

export type LearningPathResult = {
  id: number;
  recommendation_summary: string;
  recommendations: LearningPathRecommendation[];
  status: string;
  created_at: string;
};


/* ---- LMS ---- */

export type DashboardEnrollment = {
  id: number;
  course_id: number;
  course_title: string;
  course_slug: string;
  enrolled_at: string;
  completed: boolean;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  instructor_username: string | null;
  course_duration: string;
  course_image: string | null;
};

export type StudentDashboard = {
  my_courses: DashboardEnrollment[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};

export type LessonProgressRow = {
  id: number;
  lesson: number;
  lesson_title: string;
  lesson_order: number;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

export type EnrollmentProgress = {
  enrollment_id: number;
  course_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  lessons: LessonProgressRow[];
};

export type CourseResource = {
  id: number;
  title: string;
  order: number;
  download_url: string | null;
  created_at: string;
};

export type CourseReview = {
  id: number;
  rating: number;
  comment: string;
  student_username: string;
  created_at: string;
  updated_at: string;
};

export type QuizChoice = {
  id: number;
  text: string;
  order: number;
  is_correct?: boolean;
};

export type QuizQuestion = {
  id: number;
  prompt: string;
  order: number;
  points: string | number;
  allow_multiple: boolean;
  choices: QuizChoice[];
};

export type Quiz = {
  id: number;
  title: string;
  description: string;
  max_attempts: number;
  questions?: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
};

export type QuizAttempt = {
  id: number;
  quiz: number;
  quiz_title: string;
  attempt_number: number;
  score: string | number;
  total_points: string | number;
  started_at: string;
  submitted_at: string | null;
};

export type Assignment = {
  id: number;
  title: string;
  description: string;
  due_at: string | null;
  max_points: string | number;
  created_at: string;
  updated_at: string;
};

export type AssignmentSubmission = {
  id: number;
  assignment: number;
  student: number;
  student_username: string;
  content: string;
  submitted_at: string | null;
  grade: string | number | null;
  feedback: string;
  graded_by: number | null;
  graded_at: string | null;
};

export type AdminEnrollment = {
  id: number;
  student: number;
  student_username: string;
  course: number;
  course_title: string;
  course_slug: string;
  enrolled_by: number | null;
  enrolled_by_username: string | null;
  note: string;
  enrolled_at: string;
  completed: boolean;
};

export type ContactInquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  course: number | null;
  created_at: string;
};

export type NotificationEvent = {
  id: number;
  type: string;
  recipient: string;
  status: string;
  error?: string;
  title?: string;
  body?: string;
  created_at: string;
};

export type AdminUser = AuthUser & {
  is_active?: boolean;
  date_joined?: string;
};
