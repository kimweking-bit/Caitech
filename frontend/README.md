# CAITECH frontend

Public web app for **CAITECH Global Institute** (marketing, courses, enrollments, payments UI, student/instructor/admin surfaces).

## Prerequisites

- Node.js 20+ (local tooling only — not part of the product brand)
- Backend API running (see repository root `README.md`)

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Purpose                |
|----------------|------------------------|
| `npm run dev`  | Local development      |
| `npm run build`| Production build       |
| `npm run start`| Serve production build |
| `npm run lint` | ESLint                 |

## Brand

Product name, copy, and marks are CAITECH only. Do not ship framework boilerplate (default favicons, “Create Next App” copy, or stack badges) in user-facing surfaces.
