# Caitech

## Setup and deployment

### Local development

1. Open a terminal in the repo root.
2. Create and activate a virtual environment inside the backend folder:

```bash
cd "BACK END"
python -m venv venv
source venv/Scripts/activate
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
- AI_API_KEY=your-ai-service-key
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
