# CAITECH

## Local setup

1. Open a terminal in the repository root.
2. Create and activate the project virtual environment:

```bash
python -m venv .venv
. .venv/Scripts/activate
```

3. Change into the backend folder and install dependencies:

```bash
cd "BACK END"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

4. Copy the example environment file and update it:

```bash
cp .env.example .env
```

5. Apply migrations and start the app:

```bash
python manage.py migrate
python manage.py runserver
```

## Environment variables

| Name | Purpose | Example |
| --- | --- | --- |
| DEBUG | Enables development mode | True |
| SECRET_KEY | Django secret key; required in production | change-me-long-secret |
| ALLOWED_HOSTS | Allowed hosts, comma-separated | localhost,127.0.0.1,api.example.com |
| CORS_ALLOWED_ORIGINS | Allowed frontend origins | https://app.example.com,http://localhost:3000 |
| CSRF_TRUSTED_ORIGINS | CSRF trusted origins | https://app.example.com |
| DATABASE_URL | Database connection string | postgres://user:pass@host:5432/caitech |
| EMAIL_BACKEND | Mail backend | django.core.mail.backends.console.EmailBackend |
| DEFAULT_FROM_EMAIL | Sender address | noreply@example.com |
| EMAIL_HOST | SMTP host | smtp.mailgun.org |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_HOST_USER | SMTP user | user@example.com |
| EMAIL_HOST_PASSWORD | SMTP password | secret |
| EMAIL_USE_TLS | SMTP TLS on/off | True |
| EMAIL_USE_SSL | SMTP SSL on/off | False |
| FRONTEND_URL | Frontend base URL for reset links | http://localhost:3000 |
| ACCESS_TOKEN_LIFETIME_MINUTES | JWT access lifetime | 15 |
| REFRESH_TOKEN_LIFETIME_DAYS | JWT refresh lifetime | 7 |
| SECURE_SSL_REDIRECT | Redirect to HTTPS | True |
| SESSION_COOKIE_SECURE | Secure session cookies | True |
| CSRF_COOKIE_SECURE | Secure CSRF cookies | True |
| SECURE_HSTS_SECONDS | HSTS lifetime | 31536000 |
| SECURE_PROXY_SSL_HEADER | Reverse proxy header for SSL | HTTP_X_FORWARDED_PROTO,https |
| PAYMENT_PROVIDER_API_KEY | Payment provider secret | secret |
| AI_PROVIDER | AI provider name | openai_compatible |
| AI_API_KEY | AI service API key | secret |
| AI_MODEL | Model name | gpt-4o-mini |
| AI_API_BASE_URL | Provider base URL | https://api.example.com/v1 |
| AI_REQUEST_TIMEOUT_SECONDS | AI timeout in seconds | 15 |

## Running tests

From the backend folder:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

## Deployment (Gunicorn + PostgreSQL)

1. Set production environment variables, especially `DEBUG=False`, `SECRET_KEY`, `DATABASE_URL`, and security headers.
2. Build static assets:

```bash
python manage.py collectstatic --noinput
```

3. Start the app with Gunicorn:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

4. Use PostgreSQL in production by setting `DATABASE_URL` to a PostgreSQL connection string and ensuring the database exists.

Example:

```env
DATABASE_URL=postgres://caitech:password@db:5432/caitech
```

## API endpoint groups

- Authentication: `/api/v1/auth/`
- Courses and curriculum: `/api/v1/courses/`
- AI learning path: `/api/v1/ai-path/`
- Blog and site content: `/api/v1/blog/`, `/api/v1/newsletter/`, `/api/v1/contact/`
- OpenAPI schema: `/api/v1/schema/`
- Swagger UI: `/api/v1/docs/`

## API groups and key routes

### Authentication

- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/token/refresh/`
- `GET /api/v1/auth/me/`
- `POST /api/v1/auth/password/reset/`
- `POST /api/v1/auth/password/reset/confirm/`
- `POST /api/v1/auth/instructor/request/`
- `GET /api/v1/auth/instructor/requests/`
- `POST /api/v1/auth/instructor/requests/<id>/review/`

### Courses and curriculum

- `GET /api/v1/courses/`
- `GET /api/v1/courses/categories/`
- `GET /api/v1/courses/<slug>/`
- `GET /api/v1/courses/<slug>/sections/`
- `GET /api/v1/courses/sections/<id>/lessons/`
- `GET /api/v1/courses/lessons/<id>/`
- `GET /api/v1/courses/dashboard/`
- `GET /api/v1/courses/enrollments/<id>/progress/`
- `GET /api/v1/courses/<slug>/reviews/`
- `GET /api/v1/courses/quizzes/<quiz_id>/attempts/`
- `GET /api/v1/courses/<course_slug>/assignments/`

### AI learning path

- `POST /api/v1/ai-path/`
- `GET /api/v1/ai-path/responses/`

### Site content

- `GET /api/v1/blog/posts/`
- `POST /api/v1/newsletter/subscribe/`
- `GET /api/v1/newsletter/subscriptions/`
- `POST /api/v1/contact/`
- `GET /api/v1/contact/inquiries/`
