# CAITECH launch readiness notes

## Demo data (durable)

Seed (never auto-clears):

\Operations to perform:
  Apply all migrations: accounts, admin, ai_path, auth, contenttypes, courses, payments, sessions, site_content
Running migrations:
  No migrations to apply.
Seeding demo...
Demo seed complete.
  demo.student@caitech.test / CaitechDemo2026!
  demo.instructor@caitech.test / CaitechDemo2026!
  demo.admin@caitech.test / CaitechDemo2026!
  Courses: demo-bim-digital-construction, demo-ict-foundations-nairobi, demo-surveying-intro
  clear_demo is manual-only (--yes required).
Manual clear only:

\
### Demo accounts (password: )

| Role | Email / username |
|------|------------------|
| Student | demo.student@caitech.test / demo.student |
| Instructor | demo.instructor@caitech.test / demo.instructor |
| Admin | demo.admin@caitech.test / demo.admin |

### Demo programmes

-  — 6 modules, lessons, quiz, assignment, review, student enrolled + progress
-  — short ICT path
-  — free (KES 0) enrolment path

### Client demo flow

1. Open frontend + backend
2.  → open BIM demo programme → programme structure / outcomes / pricing
3. Login as demo.student →  → continue into 4. Lessons / quiz / assignment tabs
5. Login as demo.instructor →  → open course → assignment submissions
6. Login as demo.admin →  → users / courses / enrollments / orders / inquiries / blog

## Integrations (env — backend only)

Configure in backend environment (never in frontend):

- Payment: M-Pesa / card provider keys if used
- Email: SMTP for password reset + notifications
- WhatsApp: backend-only credentials
- AI path: provider keys on backend
- , strong , real , HTTPS settings in production

## Real CAITECH content

Import real courses/posts separately. Demo records use  titles and  slugs / usernames so they can coexist until deliberately removed with .
