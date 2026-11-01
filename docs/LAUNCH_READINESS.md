# CAITECH launch readiness notes

## Demo data (durable)

Seed (never auto-clears):

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
```

Demo accounts (password: `CaitechDemo2026!`):

| Role | Email / username |
|------|------------------|
| Student | demo.student@caitech.test / demo.student |
| Instructor | demo.instructor@caitech.test / demo.instructor |
| Admin | demo.admin@caitech.test / demo.admin |

### Demo programmes

- `demo-bim-digital-construction` — 6 modules, lessons, quiz, assignment, review, student enrolled + progress
- `demo-ict-foundations-nairobi` — short ICT path
- `demo-surveying-intro` — free (KES 0) enrolment path

### Client demo flow

1. Open frontend + backend
2. Browse catalogue → open BIM demo programme → programme structure / outcomes / pricing
3. Login as demo.student → My Courses → continue into lessons / quiz / assignment tabs
4. Login as demo.instructor → instructor courses → open course → assignment submissions
5. Login as demo.admin → admin → users / courses / enrollments / orders / inquiries / blog

## Official catalogue (Phase 3)

Machine-readable inventory:

- `backend/courses/data/official_catalogue_manifest.json`
- Human summary: `docs/phase3/OFFICIAL_COURSE_INVENTORY.md`

Additive sync (does **not** delete demo or non-official rows):

```bash
cd backend
python manage.py migrate
python manage.py sync_official_catalogue --dry-run
python manage.py sync_official_catalogue
```

Notes:

- Creates / updates official categories and course shells with stable `source_id`
- Default create: unpublished, free/zero price unless overridden later
- Use `--publish` only after content QA if you want storefront visibility
- Conflicts (slug already owned by a different title) are reported, not force-overwritten

Regenerate from generators if the corporate catalogue list changes:

```bash
python tools/generate_official_manifest.py
```

## Integrations (env — backend only)

Configure in backend environment (never in frontend):

- Payment: M-Pesa / card provider keys if used
- Email: SMTP for password reset + notifications
- WhatsApp: backend-only credentials
- AI path: provider keys on backend
- Production: strong `SECRET_KEY`, real `ALLOWED_HOSTS`, HTTPS settings

## Real CAITECH content

Official catalogue rows use stable `source_id` values and non-`demo-` slugs.
Demo records use `demo-` titles/slugs/usernames so they can coexist until deliberately removed with:

```bash
python manage.py clear_demo --yes
```
