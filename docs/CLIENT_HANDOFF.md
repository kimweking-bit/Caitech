# CAITECH — client handoff (waiting on client)

Platform is built and demo-ready. Production go-live needs:

## Credentials
- SMTP email: EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_USE_TLS, DEFAULT_FROM_EMAIL, CONTACT_NOTIFY_EMAIL
- M-Pesa / card: keys already listed in backend/.env.example
- WhatsApp Meta: WHATSAPP_ENABLED=true, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_NOTIFY_TO
- AI path provider API key (see .env.example / ai_path settings)
- Production Django: SECRET_KEY, DEBUG=False, ALLOWED_HOSTS, DB, CORS_ALLOWED_ORIGINS, FRONTEND_URL

## Official content (admin/import — no frontend rewrite)
Courses, curriculum, fees, media, instructors, blog, branding, real contact details.

## Demo
Keep seed_demo data. Do not run clear_demo unless intentional. Real content uses non-demo- slugs.
