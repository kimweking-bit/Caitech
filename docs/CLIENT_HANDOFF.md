# CAITECH — client handoff (waiting on client)

The platform is built, demo-ready, and production-integration ready.
Only external credentials and official CAITECH content remain.

## DONE (local / demo)

- Public website, courses, curriculum, LMS
- Auth (register, login, logout, password reset structure)
- Student / instructor / admin surfaces
- Instructor assigned-courses API (`GET /api/v1/instructor/courses/`)
- Cart, checkout, order creation, payment provider hooks + callbacks
- Email infrastructure (console in dev; SMTP via env in prod)
- WhatsApp staff notify stub (Meta Cloud API, env-gated)
- AI Learning Path (published courses only; needs provider key for live AI)
- Demo seed dataset (do not clear unless intentional)

## WAITING FOR CLIENT — credentials

Copy `backend/.env.example` → `backend/.env` and fill:

### Production Django
- `SECRET_KEY` (strong random)
- `DEBUG=False`
- `ALLOWED_HOSTS`
- Database URL / DB_* settings
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `FRONTEND_URL` (public Next.js URL)
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` on frontend

### Email (SMTP)
- `EMAIL_HOST`, `EMAIL_PORT`
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS` / `EMAIL_USE_SSL`
- `DEFAULT_FROM_EMAIL`
- `CONTACT_NOTIFY_EMAIL` (staff inbox for contact form)
- Set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` for production

### M-Pesa / card payments
- All `MPESA_*` / payment provider keys already listed in `backend/.env.example`
- Callback / return URLs must match deployed backend host

### WhatsApp (Meta Cloud API)
- `WHATSAPP_ENABLED=true`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_NOTIFY_TO` (comma-separated staff numbers)
- Optional: `WHATSAPP_API_VERSION`

### AI Learning Path
- `AI_PROVIDER`, `AI_API_KEY`, `AI_API_BASE_URL` (and any model id vars in `.env.example`)

## WAITING FOR CLIENT — official content

Load via Django admin / import (no frontend rewrite required):

- Official programmes, fees, duration, intakes, categories
- Curriculum modules / lessons / media / videos
- Quizzes and assignments
- Instructor profiles
- Blog posts, contact details, branding assets
- Real testimonials only when available

## Demo data

Keep `seed_demo` for demos and QA. Do **not** run `clear_demo` unless intentionally wiping demo.
Real CAITECH content should use non-`demo-` slugs.
