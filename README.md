# Caitech

## Setup and deployment

### Local development

1. Open a terminal in the repo root.
2. Create and activate the project virtual environment from the repository root:

```bash
python -m venv .venv
source .venv/Scripts/activate
cd "BACK END"
```

3. Install dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

4. Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

5. Apply database migrations:

```bash
python manage.py migrate
```

6. Start the server:

```bash
python manage.py runserver
```

## Versioned authentication API

The current authentication API is under `/api/v1/auth/`. Protected endpoints use
`Authorization: Bearer <access-token>`. Registration creates a student account;
role flags are read-only to users. Admin accounts are Django staff/superuser
accounts, and only staff can review instructor requests.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register/` | Public | Create a student account (`username`, `email`, `password`). |
| POST | `/api/v1/auth/login/` | Public, 5 requests/minute | Obtain access and refresh JWTs. |
| POST | `/api/v1/auth/token/refresh/` | Public | Exchange a refresh token for a new access token. |
| GET, PATCH | `/api/v1/auth/me/` | Authenticated | Read or update the current user's profile; roles are read-only. |
| POST | `/api/v1/auth/password/reset/` | Public, 3 requests/hour | Request a password reset email using `email`. The response does not reveal whether the account exists. |
| POST | `/api/v1/auth/password/reset/confirm/` | Public, 3 requests/hour | Reset using `uid`, `token`, and `new_password`. |
| POST | `/api/v1/auth/instructor/request/` | Authenticated | Submit the current account for instructor review. |
| GET | `/api/v1/auth/instructor/requests/` | Admin | Paginated queue of pending instructor requests. |
| POST | `/api/v1/auth/instructor/requests/{id}/review/` | Admin | Review with `{"approved": true}` or `{"approved": false}`. |

Password-reset links target `${FRONTEND_URL}/reset-password/`; set `FRONTEND_URL`
and a production email backend plus `DEFAULT_FROM_EMAIL` in the deployment
environment. Existing `/api/accounts/` and `/api/token/` routes remain available
for backwards compatibility.

## Versioned course API

Course and curriculum endpoints are under `/api/v1/courses/`. Public catalog
responses use page-number pagination with `count`, `next`, `previous`, and
`results`; the default page size is 20 and `page_size` is capped at 100.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET, POST | `/api/v1/courses/` | Public GET; verified instructor/admin POST | Search with `search`; filter by `category` slug, `course_type`, `delivery_mode`, `is_free`, `min_price`, and `max_price`; order by `title`, `price`, or `created_at`. |
| GET, POST | `/api/v1/courses/categories/` | Public GET; admin POST | Paginated category list and category creation. |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/categories/{slug}/` | Public GET; admin writes | Retrieve or manage a category. |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/{slug}/` | Public GET; course owner/admin writes | Retrieve, update, or delete a course. Details include ordered sections and accessible lessons. |
| GET, POST | `/api/v1/courses/{slug}/sections/` | Public GET; course owner/admin POST | List or create ordered sections. Section order is unique within a course. |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/sections/{id}/` | Public GET; course owner/admin writes | Retrieve or manage a section. |
| GET, POST | `/api/v1/courses/sections/{id}/lessons/` | Public preview GET; course owner/admin POST | List accessible lessons or create an ordered lesson in the section. |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/lessons/{id}/` | Preview or entitled GET; course owner/admin writes | Retrieve or manage a lesson. |
| GET, POST | `/api/v1/courses/lessons/{id}/resources/` | Preview or entitled GET; course owner/admin POST | List or upload files using `multipart/form-data` fields `title`, `order`, and `file`. |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/resources/{id}/` | Preview or entitled GET; course owner/admin writes | Retrieve or manage resource metadata. |
| GET | `/api/v1/courses/resources/{id}/download/` | Preview or course entitlement | Stream a resource file; storage paths are never exposed as public URLs. |

Lessons and resources marked as previews are publicly accessible. Other lessons
and their resources require course enrollment, course ownership, or admin access.
Course updates, curriculum mutations, and resource changes are restricted to
the verified course owner or an admin. Existing `/api/courses/` routes remain
available for backwards compatibility.

Course catalog responses also expose `course_type` (`diploma`, `certificate`,
`short_course`), `duration`, `delivery_modes` (a list containing `online`,
`physical`, and/or `recorded`), `intake_status` (`ongoing`, `upcoming`, `closed`),
and `whatsapp_inquiry_url`. Filter `course_type` by its exact value and
`delivery_mode` by one mode per request. These fields are blank for legacy
courses until staff populate them.

## College website content APIs

Public blog APIs show published posts only. Staff can create posts, see drafts,
and edit or delete posts. Blog image uploads use the configured media storage.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET, POST | `/api/v1/blog/posts/` | Public GET; staff POST | Paginated published posts, or create a post with title, slug, excerpt, body, optional `featured_image`, `status`, `published_at`, category slugs, and tag slugs. |
| GET, PATCH, PUT, DELETE | `/api/v1/blog/posts/{slug}/` | Public published GET; staff access/writes | Retrieve a published post or manage posts, including drafts for staff. |
| POST | `/api/v1/newsletter/subscribe/` | Public, 5 requests/hour | Subscribe with a valid `email`; duplicate addresses are rejected case-insensitively. |
| GET | `/api/v1/newsletter/subscriptions/` | Admin/staff | Paginated subscription list. |
| POST | `/api/v1/contact/` | Public, 5 requests/hour | Submit `name`, `email`, `phone`, `message`, and optional course ID. The hidden `website` honeypot must be empty. |
| GET | `/api/v1/contact/inquiries/` | Admin/staff | Paginated stored inquiries. |

Contact phone values must contain at least seven digits and messages at least ten
characters. A filled honeypot receives a generic accepted response but is not
stored. Uploaded media is served locally in development; production deployment
must provide persistent media storage and serving.

## Enrolment, progress, and reviews API

Phase 3 student endpoints also live under `/api/v1/courses/` and require a JWT
unless stated otherwise. Completion percentages are calculated from lessons in
the course; clients cannot set enrollment completion or completion timestamps.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/courses/dashboard/` | Authenticated | Paginated `my_courses` with completed/total lesson counts and progress percentage; `certificates` is an empty placeholder until certificates are implemented. |
| GET, POST | `/api/v1/courses/enrollments/{id}/progress/` | Owning enrolled student | Read lesson progress or upsert a record using `lesson` and `completed`. Lesson must belong to the enrolled course. |
| GET, POST | `/api/v1/courses/{slug}/reviews/` | Public GET; enrolled student POST | List paginated reviews or create the student's single review (`rating` 1–5, optional `comment`). |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/reviews/{id}/` | Public GET; review author/admin writes | Retrieve or manage an existing review. |

Progress is unique per enrollment and lesson. Updating all lessons to completed
sets the enrollment's completion state; uncompleting a lesson recalculates it.
Course catalog and detail responses include the average rating and review count.

## Quizzes and assignments API

Assessment endpoints use the `/api/v1/courses/` namespace and JWT
authentication. Learners must be enrolled in the associated course. Only the
verified course owner or an admin can author or change assessment content.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET, POST | `/api/v1/courses/{course_slug}/quizzes/` | Enrolled students GET; owner/admin POST | List course quizzes or create a quiz (`title`, `description`, `max_attempts`). |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/quizzes/{id}/` | Enrolled student GET; owner/admin writes | Read or manage a quiz. Student responses never include correct-answer flags. |
| GET, POST | `/api/v1/courses/quizzes/{quiz_id}/questions/` | Enrolled students GET; owner/admin POST | List quiz questions or create a question (`prompt`, `order`, `points`, `allow_multiple`). |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/questions/{id}/` | Enrolled student GET; owner/admin writes | Read or manage a question. |
| GET, POST | `/api/v1/courses/questions/{question_id}/choices/` | Enrolled students GET; owner/admin POST | List answer choices or create a choice (`text`, `is_correct`, `order`). Correctness is omitted from learner responses. |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/choices/{id}/` | Enrolled student GET; owner/admin writes | Read or manage a choice. Correctness is omitted from learner responses. |
| GET, POST | `/api/v1/courses/quizzes/{quiz_id}/attempts/` | Enrolled student; owner/admin may view results | Submit `answers` as question IDs and selected choice IDs. The server grades and stores the score; client-supplied scores are ignored. |
| GET | `/api/v1/courses/quiz-attempts/{id}/` | Attempt owner, course owner, or admin | Retrieve a stored result without answer-key data. |
| GET, POST | `/api/v1/courses/{course_slug}/assignments/` | Enrolled students GET; owner/admin POST | List or create course assignments (`title`, `description`, optional `due_at`, `max_points`). |
| GET, PATCH, PUT, DELETE | `/api/v1/courses/assignments/{id}/` | Enrolled student GET; owner/admin writes | Read or manage an assignment. |
| GET, POST | `/api/v1/courses/assignments/{assignment_id}/submissions/` | Enrolled student; owner/admin can list | Submit `content` once before the deadline or list submissions. |
| GET, PATCH, PUT | `/api/v1/courses/submissions/{id}/` | Submitting student GET; owner/admin can read and grade | Grade with `grade` and `feedback`; grader and grading time are recorded by the server. |

Quiz scores use question points and exact choice-set matching for multiple-answer
questions. Attempt limits, answer ownership, assignment deadlines, one submission
per student/assignment, and grade maximums are validated server-side.

## AI learning path API

`POST /api/v1/ai-path/` is public and limited to 5 requests per hour. Submit
`goals`, `current_skill_level` (`beginner`, `intermediate`, or `advanced`),
`interests`, and `hours_per_week`; `name`, `email`, and `phone` are optional lead
fields. The optional `website` honeypot must be empty. The service builds its
prompt from the current public course catalogue and only returns course IDs that
still exist in that catalogue. The model must return a JSON object containing
`summary` and `recommendations` entries with `course_id` and `reason`; at most
five recommendations are accepted.

`GET /api/v1/ai-path/responses/` is paginated and staff-only. It includes stored
questionnaires, optional lead data, recommendation results, provider/model
provenance, and processing status. Public results do not expose lead data.
Controlled errors include `AI_NOT_CONFIGURED` (503), `AI_PROVIDER_TIMEOUT`
(504), `AI_PROVIDER_ERROR` (502), and `AI_INVALID_RESPONSE` (502).

Configure the following deployment environment variables to enable the
OpenAI-compatible provider adapter; no provider credentials are committed:

- `AI_PROVIDER=openai_compatible`
- `AI_API_KEY=<provider-issued-secret>`
- `AI_MODEL=<provider-model-name>`
- `AI_API_BASE_URL=<provider-compatible-v1-base-url>`
- `AI_REQUEST_TIMEOUT_SECONDS=15` (optional; defaults to 15)

### Production environment variables

Use the settings below in the environment that runs the app:

- SECRET_KEY
- DEBUG=False
- ALLOWED_HOSTS=your-domain.com,www.your-domain.com
- CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
- CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com
- DATABASE_URL=postgres://user:password@host:5432/caitech
- SECURE_SSL_REDIRECT=True
- SESSION_COOKIE_SECURE=True
- CSRF_COOKIE_SECURE=True
- SECURE_HSTS_SECONDS=31536000
- SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
- PAYMENT_PROVIDER_API_KEY=your-payment-provider-key
- AI_PROVIDER=openai_compatible
- AI_API_KEY=your-ai-service-key
- AI_MODEL=your-provider-model-name
- AI_API_BASE_URL=https://your-provider.example/v1
- AI_REQUEST_TIMEOUT_SECONDS=15
- FRONTEND_URL=https://your-domain.com
- DEFAULT_FROM_EMAIL=noreply@your-domain.com
- ACCESS_TOKEN_LIFETIME_MINUTES=15
- REFRESH_TOKEN_LIFETIME_DAYS=7

### Production deployment

Collect static files and run with Gunicorn:

```bash
python manage.py collectstatic --noinput
gunicorn config.wsgi:application
```
