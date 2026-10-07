# CAITECH — Full System Report for Frontend Build

**Purpose:** Hand this document to ChatGPT (or any frontend engineer) so they can build the SPA against the existing backend without reverse-engineering the repo.

**Generated from codebase state:** `main` branch after merge of `feature/payments`  
**Backend tip commit (approx):** `c767a15` — *WIP: cart, checkout and storefront work*  
**Workspace root:** `Caitech/`  
**Primary backend git repo:** `backend/Caitech/` (nested git; this is the real project repo)

---

## 1. Executive summary

CAITECH is an **online learning platform** focused on tech education (Kenya-oriented: KES currency + M-Pesa).

### What exists today

| Layer | Status |
|--------|--------|
| **Backend API** | Django 6.1 + DRF + SimpleJWT — **ready** |
| **Domain models** | Users, courses/curriculum, enrollments, quizzes/assignments, cart/orders/payments, blog/contact, AI learning path — **ready** |
| **Server-rendered storefront** | Django templates for catalog → cart → checkout — **partial UI exists** (reference UX, not the final SPA) |
| **API docs** | OpenAPI via drf-spectacular at `/api/v1/schema/` and Swagger UI at `/api/v1/docs/` |
| **Frontend SPA** | **`frontend/` folder is empty** — nothing scaffolded yet |
| **Deploy** | Heroku-style `Procfile` with Gunicorn; Postgres via `DATABASE_URL` |

### Product goal (implied by code)

Students can:

1. Browse a course catalog  
2. Register / log in (JWT)  
3. Add courses to cart, apply coupons, checkout  
4. Pay via **M-Pesa STK** or **hosted card/PayPal**  
5. Get enrolled and study lessons in a course room  
6. Take quizzes / submit assignments  
7. Optionally get an AI-generated learning path  
8. Read blog / contact / newsletter  

Instructors (verified) can manage their courses. Admins can approve instructors, manually enrol, manage content.

---

## 2. Repository & folder structure

```
Caitech/                          # Workspace root (may or may not be a git root)
├── frontend/                     # EMPTY — build SPA here (Next.js / Vite recommended)
├── CAITECH_FULL_SYSTEM_REPORT.md # This file
└── backend/
    └── Caitech/                  # ★ REAL GIT REPO (origin remote lives here)
        ├── .git/
        ├── .gitignore
        ├── Procfile              # web: gunicorn --chdir "BACK END" config.wsgi ...
        ├── README.md             # Setup + endpoint overview
        └── BACK END/             # Django project root (note the space in folder name)
            ├── manage.py
            ├── requirements.txt
            ├── .env              # Local secrets (do not commit / do not paste to ChatGPT)
            ├── .env.example      # Safe template of all env keys
            ├── db.sqlite3        # Local default DB
            ├── staticfiles/      # Collected static (WhiteNoise)
            ├── config/           # Django project settings + root URLs
            │   ├── settings.py
            │   ├── urls.py
            │   ├── wsgi.py
            │   ├── asgi.py
            │   └── exceptions.py # Custom DRF exception handler
            ├── accounts/         # Auth, users, instructor requests, notifications
            ├── courses/          # Catalog, curriculum, enrollments, assessments, storefront
            ├── payments/         # Cart, orders, coupons, M-Pesa, hosted providers
            ├── ai_path/          # AI learning-path questionnaire
            └── site_content/     # Blog, newsletter, contact
```

### Important path notes

- Django lives under **`backend/Caitech/BACK END/`** (space in `BACK END`).
- Git operations should run inside **`backend/Caitech/`**.
- Frontend should live at **`frontend/`** (sibling of `backend/`), port **3000** (CORS already allows it).

---

## 3. Tech stack (backend)

| Component | Choice |
|-----------|--------|
| Language | Python 3.x |
| Framework | **Django 6.1.1** |
| API | **Django REST Framework 3.18.1** |
| Auth | **djangorestframework-simplejwt 5.5.1** (access + refresh) |
| Docs | **drf-spectacular 0.28.0** (OpenAPI 3 + Swagger UI) |
| CORS | **django-cors-headers 4.9.0** |
| Config | **django-environ** + optional **python-dotenv** |
| DB local | SQLite (`DATABASE_URL=sqlite:///db.sqlite3`) |
| DB prod | PostgreSQL via `DATABASE_URL` + **psycopg2-binary** |
| Static | **WhiteNoise** (CompressedManifestStaticFilesStorage) |
| Images | **Pillow** |
| HTTP client | **requests** (payment/AI providers) |
| Server | **Gunicorn** |
| Custom user | `accounts.User` (`AUTH_USER_MODEL`) |

### Full `requirements.txt`

```
asgiref==3.12.1
certifi==2026.7.22
charset-normalizer==3.5.1
Django==6.1.1
Pillow==12.0.0
django-cors-headers==4.9.0
django-environ==0.14.0
djangorestframework==3.18.1
drf-spectacular==0.28.0
djangorestframework_simplejwt==5.5.1
gunicorn==26.2.0
idna==3.20
psycopg2-binary==2.9.13
PyJWT==2.15.0
python-dotenv==1.2.3
requests==2.34.2
sqlparse==0.6.0
tzdata==2026.4
urllib3==2.8.0
whitenoise==6.12.0
```

---

## 4. How to run the backend (local)

From `backend/Caitech/`:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

cd "BACK END"
pip install -r requirements.txt
# Ensure .env exists (copy from .env.example)
python manage.py migrate
python manage.py createsuperuser   # optional
python manage.py runserver
```

### Key local URLs

| URL | Purpose |
|-----|---------|
| `http://127.0.0.1:8000/` | Django storefront catalog (HTML) |
| `http://127.0.0.1:8000/admin/` | Django admin |
| `http://127.0.0.1:8000/api/v1/docs/` | **Swagger UI — use this while building frontend** |
| `http://127.0.0.1:8000/api/v1/schema/` | Raw OpenAPI schema |
| `http://127.0.0.1:8000/api/v1/auth/login/` | JWT login |

### Production start (Procfile)

```
web: gunicorn --chdir "BACK END" config.wsgi:application --bind 0.0.0.0:$PORT
```

---

## 5. Environment variables (`.env.example`)

```env
# Core Django
DEBUG=True
SECRET_KEY=change-me-generate-a-long-random-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=sqlite:///db.sqlite3

# Security (production)
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_HSTS_SECONDS=0
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
X_FRAME_OPTIONS=DENY

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@caitech.local
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=False
EMAIL_USE_SSL=False
FRONTEND_URL=http://localhost:3000
SITE_URL=http://localhost:8000

# JWT
ACCESS_TOKEN_LIFETIME_MINUTES=15
REFRESH_TOKEN_LIFETIME_DAYS=7

# Payments
PAYMENT_PROVIDER_API_KEY=
PAYMENT_REQUEST_TIMEOUT_SECONDS=15
MPESA_ENVIRONMENT=sandbox
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
MPESA_CALLBACK_SECRET=
CARD_HOSTED_CHECKOUT_URL=
CARD_WEBHOOK_SECRET=
PAYPAL_HOSTED_CHECKOUT_URL=
PAYPAL_WEBHOOK_SECRET=

# AI learning path
AI_API_KEY=
AI_PROVIDER=openai_compatible
AI_MODEL=
AI_API_BASE_URL=
AI_REQUEST_TIMEOUT_SECONDS=15
```

### Frontend-relevant settings

- **CORS** already allows `http://localhost:3000` and `http://127.0.0.1:3000`.
- **`FRONTEND_URL`** used for email links / redirects back to SPA.
- **`SITE_URL`** backend public base (callbacks).
- JWT access default **15 minutes**, refresh **7 days**.

---

## 6. Django apps & responsibilities

| App | Role |
|-----|------|
| **`config`** | Settings, root URLconf, exception handler, WSGI |
| **`accounts`** | Custom User, register/login/JWT, password reset, instructor request queue, admin user lists, outbound email Notification log |
| **`courses`** | Categories, Courses, Sections, Lessons, Resources, Enrollments, Progress, Reviews, Quizzes, Assignments; **storefront HTML**; course API |
| **`payments`** | Cart, CartItem, Order, OrderItem, PaymentTransaction, Coupon, CouponRedemption; M-Pesa + hosted card/PayPal providers; checkout services |
| **`ai_path`** | Learning-path questionnaire + stored AI responses |
| **`site_content`** | Blog categories/tags/posts, newsletter subscribers, contact inquiries |

### INSTALLED_APPS (project apps)

```
accounts, rest_framework, rest_framework_simplejwt,
corsheaders, drf_spectacular, courses, payments, ai_path, site_content
```

---

## 7. Domain models (detailed)

### 7.1 `accounts.User` (extends `AbstractUser`)

Extra fields beyond Django’s username/email/password/first_name/last_name/is_staff/is_superuser/is_active:

| Field | Type | Notes |
|-------|------|--------|
| `is_student` | Boolean | default **True** |
| `is_instructor` | Boolean | default False |
| `is_verified_instructor` | Boolean | default False — required to manage courses as instructor |
| `bio` | Text | blank |
| `profile_picture` | ImageField | optional |
| `phone_number` | CharField(20) | blank — used for M-Pesa |

**Roles (boolean flags, not a single enum):**

- **Student:** `is_student=True` (default on register)
- **Instructor (pending):** `is_instructor=True`, `is_verified_instructor=False`
- **Verified instructor:** both instructor flags True
- **Admin/staff:** `is_staff` / `is_superuser`

### 7.2 `accounts.Notification`

Outbound email/notification log:

- Types include registration, enrolment, etc.
- Statuses: pending / sent / failed
- Fields roughly: `type`, `recipient`, `status`, `error`, `created_at`, link to user where applicable

### 7.3 `courses.Category`

- `name`, `slug` (unique)

### 7.4 `courses.Course`

**Enums:**

- **Currency:** `KES`, `USD`
- **CourseType:** `diploma`, `certificate`, `short_course`
- **Level:** `beginner`, `intermediate`, `advanced`
- **DeliveryMode:** `online`, `physical`, `recorded` (stored in JSON list `delivery_modes`)
- **IntakeStatus:** `ongoing`, `upcoming`, `closed`

**Core fields (representative):**

| Field | Notes |
|-------|--------|
| `title`, `slug` (unique) | Catalog identity |
| `short_description` | max 280 |
| `description` | full text |
| `thumbnail` | image |
| `category` | FK → Category |
| `instructor` | FK → User |
| `price` | decimal |
| `currency` | KES/USD |
| `is_published` | bool — public catalog filter |
| `course_type`, `level` | enums |
| `duration` | string |
| `delivery_modes` | JSON list |
| `intake_status` | enum |
| `seat_capacity` | optional int — enrollment limits |
| `created_at` | datetime |

**Business helpers in model:** seat availability checks considering enrollments + pending/draft orders that hold seats.

### 7.5 Curriculum hierarchy

```
Course
 └── Section (order)
      └── Lesson (order; may also FK course)
           └── (progress per enrollment)
 └── CourseResource (files)
 └── Quiz → Question → Choice
 └── Assignment → AssignmentSubmission
 └── CourseReview
 └── Enrollment → EnrollmentProgress
```

#### `Section`
- FK `course`, `title`, `order`

#### `Lesson`
- FK `course`, FK `section` (nullable-capable depending on migrations)
- `title`, content fields (text/video URL style), `order`, `created_at`
- Resources may attach at course level via `CourseResource`

#### `CourseResource`
- FK course, title/file upload under `course_resources/%Y/%m/`, order

#### `Enrollment`
- FK `student` → User
- FK `course`
- Unique together student+course
- Timestamps (`enrolled_at` / similar)
- Progress via related `EnrollmentProgress`

#### `EnrollmentProgress`
- FK enrollment, FK lesson
- `completed` bool, `completed_at`
- Unique (enrollment, lesson)

#### `CourseReview`
- FK course, FK student
- `rating` 1–5 (check constraint), `comment`, `created_at`
- Unique (course, student)

### 7.6 Assessments

#### `Quiz`
- FK course, `title`, `description`, ordering/meta

#### `Question`
- FK quiz, `text`, `order`

#### `Choice`
- FK question, `text`, `is_correct`, `order`
- Unique choice order per question

#### `QuizAttempt`
- FK quiz, FK student, `attempt_number`, score/submitted fields
- Unique (quiz, student, attempt_number)

#### `Assignment`
- FK course, `title`, description/due fields, order

#### `AssignmentSubmission`
- FK assignment, FK student
- `content` text (and possibly file depending on serializers)
- grading fields if present
- constraints on uniqueness student+assignment

### 7.7 `payments` models

#### `Order`
**Status:** `draft` | `pending` | `paid` | `failed` | `cancelled` | `expired`

| Field | Notes |
|-------|--------|
| `reference` | UUID, unique |
| `user` | FK User PROTECT |
| `status` | see above, default draft |
| `currency` | KES/USD |
| `customer_email`, phone, name fields | checkout snapshot |
| `subtotal`, `discount_amount`, `total` | decimals, non-negative checks |
| `coupon` | FK Coupon null |
| `expires_at` | seat hold / payment window |
| timestamps | created/updated |

#### `OrderItem`
- FK order, FK course PROTECT
- `course_title` snapshot, `unit_price`, `line_total`, quantity-style fields

#### `Cart`
- **OneToOne** User (`related_name='course_cart'`)
- `coupon_code` string (applied code before checkout)
- updated_at

#### `CartItem`
- FK cart, FK course
- Unique (cart, course) — one line per course

#### `PaymentTransaction`
**Provider:** `mpesa` | `card` | `paypal`  
**Status:** `initiated` | `pending` | `confirmed` | `failed` | `cancelled` | `expired`

- UUID `reference`
- FK order
- amount, currency, provider refs, raw callback payloads, phone for M-Pesa, timestamps

#### `Coupon`
- code, percent or fixed discount fields, active flags, validity window, usage limits, currency constraints as implemented

#### `CouponRedemption`
- links coupon + user/order, `redeemed_at`

### 7.8 `ai_path.LearningPathResponse`

| Field | Notes |
|-------|--------|
| `status` | pending / completed / failed |
| `goals` | text |
| `current_skill_level` | char |
| `interests` | text |
| `hours_per_week` | positive small int |
| response/result JSON or text | AI output |
| `created_at` | |

(May be anonymous or user-linked depending on view auth — check Swagger.)

### 7.9 `site_content`

#### `BlogCategory` — name, slug  
#### `Tag` — name, slug  
#### `Post`
- status: `draft` | `published`
- title, slug, body/content, FK category, M2M tags
- author/publish timestamps, optional course link
- only published should be public

#### `NewsletterSubscriber` — email unique, timestamps  
#### `ContactInquiry` — name, email, message, created_at  

---

## 8. Authentication & authorization

### Auth mechanism

- **JWT Bearer tokens** via SimpleJWT.
- Login returns **access** + **refresh**.
- Send header: `Authorization: Bearer <access>`.
- Refresh: `POST /api/v1/auth/token/refresh/` with `{ "refresh": "..." }`.

### Typical auth endpoints (`/api/v1/auth/`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/register/` | Public | Create user |
| POST | `/login/` | Public | Obtain JWT pair |
| POST | `/token/refresh/` | Public | Refresh access |
| GET | `/me/` (or profile endpoint name in views) | JWT | Current user |
| Password reset request/confirm | under auth | Public | Email token flow |
| Instructor request | under auth | JWT | Request instructor role |
| Admin instructor queue / approve | under auth | Staff | Verify instructors |
| Admin user list | under auth | Staff | List users |
| Admin notifications | under auth | Staff | Notification log |

**Exact path list from `accounts/api_urls.py`:**

- `register/`
- `login/`
- `token/refresh/`
- plus me/profile, password reset, instructor request, admin instructor list, admin user list, instructor request queue, admin notifications  
→ **Confirm final paths in Swagger** (`/api/v1/docs/`) because view names may include `me/`, `password-reset/`, etc.

### Permission model (courses)

From `courses/permissions.py`:

- **`user_can_manage_course(user, course)`** if:
  - staff/superuser, OR
  - verified instructor **and** is the course.instructor
- Safe methods (GET) often public for published catalog
- Write methods require manager permissions
- Enrollment-gated content: user must be enrolled (or staff/manager)
- Assessments: student enrolled vs instructor manage split via `assessment_permissions.py`

### Frontend auth responsibilities

1. Store access + refresh securely (memory + httpOnly cookie preferred; localStorage acceptable for MVP).
2. Attach Bearer token to API calls.
3. On 401, try refresh once; if fail, redirect to login.
4. Gate UI by flags: `is_student`, `is_instructor`, `is_verified_instructor`, `is_staff`.

---

## 9. Complete URL map

### 9.1 Root (`config/urls.py`)

| Path | Target |
|------|--------|
| `''` | `courses.storefront_urls` (HTML storefront) |
| `admin/` | Django admin |
| `api/v1/auth/` | accounts API |
| `api/v1/courses/` | courses API |
| `api/v1/payments/` | payments API |
| `api/v1/ai-path/` | ai_path API |
| `api/v1/content/` or blog/contact includes | site_content API (see below) |
| `api/v1/schema/` | OpenAPI schema |
| `api/v1/docs/` | Swagger UI |
| media files | served when DEBUG |

*(Exact site_content mount prefix is under `/api/v1/` — README lists blog/contact under content-style paths; confirm in Swagger.)*

### 9.2 Storefront HTML (reference UX only)

From `courses/storefront_urls.py` (mounted at site root):

| Path | Name | Page |
|------|------|------|
| `/` | storefront-home | Catalog |
| `/courses/` | storefront-catalog | Catalog |
| `/courses/<slug>/` | course detail | Course detail + add to cart |
| `/cart/` | cart | Cart |
| `/checkout/` | checkout | Checkout / pay |
| `/payment/return/` | payment return | Post-payment |
| `/dashboard/` | student dashboard | Enrollments |
| `/learn/<slug>/` or course room | course room | Lessons player |
| `/account/login/` | login | Session login for storefront |
| `/account/register/` | register | |
| `/account/logout/` | logout | |

**Templates** (`courses/templates/courses/storefront/`):

- `base.html`, `catalog.html`, `course_detail.html`, `cart.html`, `checkout.html`
- `payment_return.html`, `dashboard.html`, `course_room.html`
- `login.html`, `register.html`

**Use these as UX reference** for the React/Next UI — not as the production frontend.

### 9.3 Auth API — `/api/v1/auth/`

(See section 8; full list in Swagger.)

### 9.4 Courses API — `/api/v1/courses/`

From `courses/api_urls.py` (pattern list):

| Area | Paths (relative to `/api/v1/courses/`) |
|------|----------------------------------------|
| Catalog | `''` or list endpoint → CourseCatalogV1 |
| Course detail | `<slug>/` |
| Curriculum write/read | sections/lessons nested under course slug |
| Reviews | under course |
| Enrollments | my enrollments, progress mark complete |
| Admin manual enrol | admin manual-enrol path |
| Quizzes | `<course_slug>/quizzes/`, `quizzes/<pk>/`, questions/choices nested |
| Quiz attempts | submit attempt endpoints |
| Assignments | list/create/detail, submissions list/create/detail |

**Representative named routes include:**

- `api-v1-course-list`
- `api-v1-course-quizzes`
- `api-v1-quiz-detail`
- assignment + submission v1 routes
- progress routes under enrollment
- `api-v1-admin-manual-enrollment`

→ **Always verify request/response bodies in `/api/v1/docs/`.**

### 9.5 Payments API — `/api/v1/payments/`

Exact routes from `payments/api_urls.py`:

| Method (typical) | Path | Name | Purpose |
|------------------|------|------|---------|
| GET/POST | `cart/` | payments-cart | Get cart / add item |
| DELETE/PATCH | `cart/items/<id>/` | cart item detail | Update/remove line |
| POST | `cart/coupon/` | payments-cart-coupon | Apply/remove coupon |
| POST | `cart/checkout/` | payments-cart-checkout | Convert cart → order + start pay |
| POST | `orders/` | order create | Direct order create (if exposed) |
| GET | `orders/` | order list | My orders |
| GET | `orders/<uuid:reference>/` | order detail | Poll status |
| POST | `orders/<reference>/pay/` | initiate payment | Choose provider |
| POST | `callbacks/mpesa/` | M-Pesa callback | **Server-to-server only** |
| POST | `callbacks/hosted/<provider>/` | hosted callback | **Server-to-server only** |

**Frontend never calls provider callback URLs** — only cart/checkout/order/pay + poll order status.

### 9.6 AI path — `/api/v1/ai-path/`

| Path | Purpose |
|------|---------|
| `''` POST | Submit questionnaire |
| `responses/` GET | List prior responses (auth/admin as designed) |

### 9.7 Site content — under `/api/v1/` (blog/contact/newsletter)

From `site_content/api_urls.py`:

- `blog/posts/` list/create  
- `blog/posts/<slug>/` detail  
- newsletter subscribe (+ maybe unsubscribe)  
- `contact/` create inquiry  
- `contact/inquiries/` list (staff)

README also documents:

- `POST /api/v1/contact/`
- `GET /api/v1/contact/inquiries/`

---

## 10. Critical user flows (for frontend)

### Flow A — Browse & open course

1. `GET /api/v1/courses/` → list published courses (filters: category, level, type, search if supported).
2. `GET /api/v1/courses/<slug>/` → detail, price, instructor, curriculum outline.
3. If not logged in, allow browse; lock learn/checkout behind auth.

### Flow B — Register / login

1. `POST /api/v1/auth/register/` with username, email, password, optional phone/name.
2. `POST /api/v1/auth/login/` → `{ access, refresh }`.
3. `GET` me/profile endpoint → role flags for nav.

### Flow C — Cart → checkout → pay → enrolled

```
[Course detail] Add to cart
    → POST /api/v1/payments/cart/  { "course_id": 123 }
[Cart page]
    → GET  /api/v1/payments/cart/
    → POST /api/v1/payments/cart/coupon/  { "coupon_code": "SAVE10" }  (optional)
    → DELETE item if needed
[Checkout]
    → POST /api/v1/payments/cart/checkout/
       body includes customer phone/email and payment_provider preference
    ← order.reference + payment instructions / redirect URL / STK push status
[Pay]
    M-Pesa: user enters phone; backend triggers STK; frontend polls order
    Card/PayPal: redirect to hosted checkout URL; return to FRONTEND_URL return page
[Confirm]
    → GET /api/v1/payments/orders/<reference>/
    when status=paid → enrollment exists → go to course room / dashboard
```

**Serializers of interest (payments):**

- `CartAddSerializer`: `{ "course_id": int }`
- `CartCouponSerializer`: `{ "coupon_code": str }`
- Checkout/pay serializers include provider choice, phone, amount display fields, optional `redirect_url`

**Order statuses to show in UI:** draft → pending → paid | failed | cancelled | expired

### Flow D — Learn

1. `GET` my enrollments  
2. Open course room by slug  
3. List sections/lessons  
4. Mark lesson complete → progress endpoint  
5. Download resources if enrolled  

### Flow E — Quiz / assignment

1. List quizzes for course (enrolled)  
2. Fetch quiz with questions (choices; correct answers hidden for students)  
3. Submit attempt → score response  
4. Assignments: submit text/file → instructor grades later  

### Flow F — Instructor

1. Request instructor role  
2. Wait for admin verification (`is_verified_instructor`)  
3. CRUD own courses, sections, lessons, quizzes, assignments  
4. View submissions  

### Flow G — Admin

1. Django admin **or** staff API endpoints  
2. Approve instructors  
3. Manual enrollment  
4. Publish blog posts, view contact inquiries  

### Flow H — AI learning path

1. Form: goals, skill level, interests, hours/week  
2. `POST /api/v1/ai-path/`  
3. Show pending → completed path content  
4. Rate-limited (`ai_path`: 5/hour in settings)

---

## 11. Payments architecture (backend internals)

```
payments/
  cart.py          # get_or_create cart, add/remove, apply coupon helpers
  services.py      # checkout, mark paid, create enrollments, expire orders
  providers/
    base.py        # provider interface
    mpesa.py       # Safaricom STK push + callback verify
    hosted.py      # card/PayPal hosted checkout + webhooks
  views.py         # DRF endpoints
  serializers.py
  models.py
```

### Providers

| Provider key | UX | Config |
|--------------|-----|--------|
| `mpesa` | STK push to `phone_number` | MPESA_* env vars |
| `card` | Redirect to hosted URL | CARD_HOSTED_CHECKOUT_URL, CARD_WEBHOOK_SECRET |
| `paypal` | Redirect to hosted URL | PAYPAL_HOSTED_CHECKOUT_URL, PAYPAL_WEBHOOK_SECRET |

### After successful payment

Backend should:

1. Set `Order.status = paid`  
2. Create `Enrollment` rows for each order item course  
3. Record `CouponRedemption` if coupon used  
4. Emit notification email (console backend in dev)  

### Seat holds

Draft/pending orders with future `expires_at` count toward seat capacity so two users can’t overbook a limited course.

---

## 12. API conventions for frontend

### Base URL

```
Development: http://127.0.0.1:8000/api/v1
Production:  https://<api-host>/api/v1
```

### Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>   # when required
Accept: application/json
```

### Auth scheme

- DRF DEFAULT_AUTHENTICATION: JWT (+ maybe session for browsable API)
- Unauthenticated requests allowed on public catalog/blog endpoints

### Error shape

Custom exception handler in `config.exceptions.custom_exception_handler` — expect DRF-style:

```json
{
  "detail": "Error message"
}
```

or field errors:

```json
{
  "email": ["This field is required."],
  "password": ["Too short."]
}
```

### Throttling (settings)

Rate limits exist for sensitive endpoints, e.g.:

- `contact`: 5/hour  
- `ai_path`: 5/hour  

(Exact throttle scope names in `REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']`.)

### Pagination / filtering

Check Swagger for each list endpoint — catalog may support query params for category, search, ordering.

### Decimal / money

Prices are decimals; always display with `currency` (`KES` or `USD`). Do not hardcode `$`.

### IDs vs slugs

- Courses: public identity is **`slug`**  
- Cart add uses **`course_id`** (integer PK)  
- Orders: public identity is UUID **`reference`**

---

## 13. Recommended frontend architecture

### Suggested stack

- **Next.js 14+ (App Router) + TypeScript** **or** **Vite + React + TypeScript**
- TanStack Query (data fetching/cache)
- Zustand or context for auth session
- Tailwind CSS (matches modern LMS look)
- React Hook Form + Zod
- Run on **port 3000**

### Suggested route map (SPA)

| Route | Page |
|-------|------|
| `/` | Marketing home |
| `/courses` | Catalog |
| `/courses/[slug]` | Course detail + CTA |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/payments/return` | Return/callback landing (poll order) |
| `/login`, `/register` | Auth |
| `/dashboard` | Student home / enrollments |
| `/learn/[slug]` | Course room |
| `/learn/[slug]/quiz/[id]` | Quiz |
| `/learn/[slug]/assignments/[id]` | Assignment |
| `/instructor/*` | Instructor console |
| `/ai-path` | Questionnaire + result |
| `/blog`, `/blog/[slug]` | Blog |
| `/contact` | Contact form |
| `/account` | Profile, phone number for M-Pesa |

### API client module

```ts
// pseudo
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL // http://127.0.0.1:8000/api/v1

async function api(path, { method, body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  // handle 401 → refresh
  return res.json()
}
```

### Env for frontend

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_NAME=CAITECH
```

---

## 14. UI reference already in backend

The Django storefront is a **working partial UI** for:

1. Course grid/catalog  
2. Course detail with enroll/pay CTA  
3. Cart  
4. Checkout  
5. Payment return  
6. Dashboard  
7. Course room  
8. Login/register  

Static assets under `courses/static/courses/` (if present) and templates under `courses/templates/courses/storefront/`.

**Frontend builders should open the running storefront and screenshot flows** before redesigning.

---

## 15. What is incomplete / WIP

Be honest with the frontend team:

1. **`feature/payments` was merged as WIP** — cart/checkout/storefront work may still have rough edges.  
2. **No SPA yet** — `frontend/` empty.  
3. **Provider credentials** may be empty in `.env` — M-Pesa/card will need sandbox keys for real charges; UI can still be built against mocked/paid statuses in dev.  
4. **AI path** needs `AI_API_KEY` / base URL or will fail generation.  
5. **Email** defaults to console backend — password reset links print in server logs.  
6. Some README endpoint lines may lag code — **Swagger is source of truth**.  
7. Nested folder name `BACK END` is awkward for tools — keep paths quoted on Windows.  
8. Storefront uses **Django sessions** for HTML login; SPA must use **JWT only** (don’t mix unless intentionally supporting both).

---

## 16. Testing & quality

Backend has tests under:

- `courses/tests.py`, `courses/test_storefront.py`
- `payments/tests.py`
- `accounts/tests.py` (if present)
- `ai_path/tests.py`
- `site_content/tests.py` (if present)

Run:

```bash
cd "BACK END"
python manage.py test
```

---

## 17. Deployment notes

- Set `DEBUG=False`, strong `SECRET_KEY`, `DATABASE_URL` Postgres.  
- Set `CORS_ALLOWED_ORIGINS` to real frontend origin.  
- Set `FRONTEND_URL` / `SITE_URL` to HTTPS URLs.  
- Configure M-Pesa callback URL to publicly reachable `https://api.../api/v1/payments/callbacks/mpesa/`.  
- WhiteNoise serves static; media may need S3 later (currently local FileSystemStorage).  
- Procfile already defined for Gunicorn.

---

## 18. Entity relationship (simplified)

```
User 1───1 Cart ───* CartItem *───1 Course
User 1───* Order ───* OrderItem *───1 Course
Order 1───* PaymentTransaction
Order *───? Coupon
User 1───* Enrollment *───1 Course
Enrollment 1───* EnrollmentProgress *───1 Lesson
Course 1───* Section 1───* Lesson
Course 1───* Quiz 1───* Question 1───* Choice
Course 1───* Assignment 1───* AssignmentSubmission
Course *───1 Category
Course *───1 User (instructor)
User 1───* CourseReview *───1 Course
```

---

## 19. Suggested build order for frontend team

### Phase 0 — Scaffold
- Create Next/Vite app in `frontend/`
- API client + auth store + layout shell
- Wire env to `http://127.0.0.1:8000/api/v1`

### Phase 1 — Public
- Catalog list + course detail
- Blog list/detail, contact form
- Marketing home

### Phase 2 — Auth
- Register, login, refresh, logout
- Profile + phone number
- Protected route wrapper

### Phase 3 — Commerce (priority)
- Add to cart, cart page, coupon
- Checkout (M-Pesa phone + card redirect)
- Order status polling + success/failure pages
- Dashboard enrollments list

### Phase 4 — Learning
- Course room, lesson content, mark complete
- Resources download
- Quizzes + assignments

### Phase 5 — Instructor / admin light
- Instructor course CRUD
- Submission review
- Staff views as needed

### Phase 6 — AI path + polish
- Questionnaire UX
- Empty states, error toasts, loading skeletons
- Mobile responsive, accessibility

---

## 20. Prompt you can paste to ChatGPT to start building

```
You are a senior frontend engineer. Build a production-quality SPA for CAITECH, an online learning platform.

Backend is already built (Django REST + JWT). Do NOT rebuild the backend.

API base: http://127.0.0.1:8000/api/v1
Swagger: http://127.0.0.1:8000/api/v1/docs/
CORS allows http://localhost:3000

Stack: Next.js (App Router) + TypeScript + Tailwind + TanStack Query.

Implement in this order:
1) project scaffold in /frontend
2) auth (register/login/refresh/me) with Bearer JWT
3) course catalog + course detail
4) cart + coupon + checkout (M-Pesa phone + hosted card/paypal redirect)
5) order status polling by UUID reference
6) student dashboard + course room + lesson progress
7) quizzes/assignments
8) blog + contact
9) AI learning path form

Money: support KES and USD from API fields.
Course URLs use slugs; cart add uses course_id; orders use UUID reference.

Read the full system report below for models, endpoints, and flows.
[ATTACH THIS ENTIRE FILE]
```

---

## 21. Quick reference — most important endpoints

```
POST   /api/v1/auth/register/
POST   /api/v1/auth/login/
POST   /api/v1/auth/token/refresh/

GET    /api/v1/courses/
GET    /api/v1/courses/{slug}/

GET    /api/v1/payments/cart/
POST   /api/v1/payments/cart/              { "course_id": 1 }
POST   /api/v1/payments/cart/coupon/       { "coupon_code": "..." }
POST   /api/v1/payments/cart/checkout/
GET    /api/v1/payments/orders/{reference}/

POST   /api/v1/ai-path/
GET    /api/v1/content-or-blog paths       (see Swagger)

GET    /api/v1/docs/                       ← source of truth
```

---

## 22. Files to open first (backend)

| File | Why |
|------|-----|
| `backend/Caitech/README.md` | Official setup + endpoint groups |
| `BACK END/config/urls.py` | Mount points |
| `BACK END/config/settings.py` | Auth, CORS, JWT, throttles |
| `BACK END/accounts/models.py` | User roles |
| `BACK END/courses/models.py` | Full LMS schema |
| `BACK END/payments/models.py` | Commerce schema |
| `BACK END/payments/api_urls.py` | Cart/checkout routes |
| `BACK END/courses/api_urls.py` | LMS routes |
| `BACK END/courses/storefront_urls.py` | HTML UX map |
| `BACK END/courses/templates/courses/storefront/*` | UI reference |
| `BACK END/.env.example` | Config surface |
| Swagger `/api/v1/docs/` | Request/response contracts |

---

## 23. Bottom line

**You have a real backend on `main`** with:

- JWT auth and roles  
- Full course/LMS data model  
- Cart, coupons, orders, M-Pesa + hosted payments  
- Django HTML storefront as a visual prototype  
- OpenAPI docs  

**You do not yet have a frontend app.**  

Next step: scaffold `frontend/` against `/api/v1` and implement Phase 1–3 (catalog → auth → cart/checkout) first — that unblocks the core business path: **choose course → pay → learn**.

---

*End of report. Prefer live Swagger over this document if any path conflicts — code can drift slightly ahead of README.*
