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
- ACCESS_TOKEN_LIFETIME_MINUTES=15
- REFRESH_TOKEN_LIFETIME_DAYS=7

### Production deployment

Collect static files and run with Gunicorn:

```bash
python manage.py collectstatic --noinput
gunicorn config.wsgi:application
```
