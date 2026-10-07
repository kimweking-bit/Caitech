# CAITECH Global Institute — Phase 1 Design: Design System, Public Shell & Homepage

**Status:** Implementation-ready (Revision 2 — post design review)  
**Scope:** Phase 1 only (design system, root layout, header/footer, page shell, UI primitives, homepage, thin API client, SEO/a11y baseline)  
**Stack:** Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · Django REST `/api/v1`  
**Repo root:** monorepo `Caitech/` · frontend at `frontend/`  
**Assumption:** Backend remains as-is; no Django rewrite. Work proceeds on `main` via ordered PRs.

---

## Context / Problem

CAITECH Global Institute has a working Django REST backend (courses, auth/JWT, cart/payments, AI path, site content) and a Next.js 16 frontend that still ships the create-next-app starter. Production `next build` passes, but there is no design system, no institutional shell, and no homepage that reflects a serious technical institute.

The product must not look like a generic LMS or AI-generated course marketplace. It should read as a **technical institute + architecture studio + premium editorial** property: restrained, specific, Kenya-aware (KES, practical programs), tool-fluent (AutoCAD, BIM, Cisco, electronics, etc.).

**Verified frontend inventory (Phase 1 starting point):**

| Path | State |
|------|--------|
| `frontend/app/globals.css` | Default Tailwind + zinc dark tokens |
| `frontend/app/layout.tsx` | Geist fonts, "Create Next App" metadata |
| `frontend/app/page.tsx` | Starter page |
| `frontend/package.json` | next 16.4.0, react 19.3.0, tailwindcss 4, `@tailwindcss/turbopack` |
| `frontend/next.config.ts` | turbopack CSS loader, `cacheComponents`, `partialPrefetching` |
| `components/`, `lib/`, `hooks/`, `types/` | **Absent** |
| `docs/CAITECH_VERIFIED_FRONTEND_API_CONTRACT.md` | **Empty (0 bytes)** — do not invent conflicting contracts |

Phase 1 replaces the scaffold with a distinctive design system, public chrome, homepage flagship, and a thin API client skeleton ready for Phase 2 catalog work.

---

## Goals

1. Establish **CAITECH design tokens** (color, type, space, radius, elevation) in Tailwind v4 `@theme` + CSS variables.
2. Ship a **root layout** with intentional fonts, metadata baseline, skip link, header, footer, and stable page container.
3. Build **SiteHeader + MobileNav + SiteFooter** covering the public IA with correct active states and a11y.
4. Deliver **UI primitives** sufficient for shell + homepage (Button, Link, Badge, Card, Container, Section, form baselines).
5. Ship a **flagship homepage** that communicates institute positioning without fake stats, testimonials, or partner logos.
6. Create **folder architecture** under `frontend/` matching the target tree.
7. Add a **thin API client foundation** (env, fetch wrapper, error type, courses list helper) without full catalog integration.
8. Meet **SEO + accessibility baselines** for public shell routes.
9. Leave **clear stubs** for non-home public routes so nav/footer never 404.
10. Produce an **ordered PR plan** an engineer can execute without redesign.

---

## Non-Goals

Explicitly **out of Phase 1**:

- Full courses catalog UI, course detail, category pages beyond route stubs
- Auth flows (login/register/forgot/reset) beyond stub pages + link targets
- Cart, checkout, M-Pesa/payment return UI
- Blog index/detail beyond stubs + optional homepage teaser empty state
- AI Learning Path interactive product (homepage teaser + stub route only)
- Admin `/admin/*` (folder stub only)
- CMS, i18n, dark-mode theme toggle
- Animation libraries (Framer Motion, etc.) unless a one-line CSS transition is enough
- Inventing backend endpoints or response shapes that contradict live schema
- Fake social proof (testimonials, learner counts, employer logos, “98% job ready”)
- Installing UI kits (shadcn/radix-themes/MUI) — hand-rolled primitives only
- Full form validation library integration (optional later; native + thin helpers in Phase 1)

---

## Users & Use Cases

| User | Phase 1 use cases |
|------|-------------------|
| Prospective learner (Kenya / region) | Land on homepage; understand what CAITECH is; scan schools/areas; see featured courses if API returns data; navigate to Courses / About / Contact / AI Path stubs |
| Returning browser | Use header/footer IA; open mobile nav; reach Login/Register stubs |
| Engineer (implementer) | Tokens, components, and API skeleton clear enough to implement Phase 2 without redesign |
| Search / social crawler | Title/description/OG baseline on home + stub routes |

**Not Phase 1 primary users:** enrolled students managing coursework, admins, finance ops.

---

## Current State

- Backend: DRF at `/api/v1` (JWT SimpleJWT, courses public catalog, cart/payments, ai-path, site_content). Error shape typically `{ detail }` or field errors. **Authoritative field-level contract doc is empty** — discover via `/api/v1/schema/` in Phase 2; Phase 1 uses **provisional** types marked as such.
- Frontend: Next 16 App Router starter only; Tailwind v4 with `@import "tailwindcss"`; `next.config.ts` enables experimental/cache flags including `cacheComponents` — **must be validated** against dynamic API fetches (see Key Decisions + spike).
- Brand north star supplied: petrol `#12343B`, lime `#C7F000` / `#C8F13F`, ground `#F5F5F0`, surfaces white, text deep navy/charcoal.
- No existing component API to preserve.

---

## Proposed Design

### 1. Folder architecture

```
frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx                 # Root shell
│   ├── page.tsx                   # Homepage
│   ├── not-found.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── courses/page.tsx           # Stub
│   ├── courses/[slug]/page.tsx
│   ├── categories/[slug]/page.tsx
│   ├── about/page.tsx
│   ├── ai-path/page.tsx
│   ├── blog/page.tsx
│   ├── blog/[slug]/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── payments/return/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   ├── PageHeader.tsx
│   │   └── SkipLink.tsx
│   ├── navigation/
│   │   ├── MainNav.tsx
│   │   ├── MobileNav.tsx          # Client component
│   │   ├── NavLink.tsx
│   │   └── nav-config.ts
│   ├── hero/
│   │   └── HomeHero.tsx
│   ├── home/
│   │   ├── WhatIsSection.tsx
│   │   ├── SchoolsSection.tsx
│   │   ├── FeaturedCoursesSection.tsx
│   │   ├── WhySection.tsx
│   │   ├── PracticalSection.tsx
│   │   ├── AiPathTeaser.tsx
│   │   ├── BlogTeaser.tsx
│   │   └── CtaBand.tsx
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   └── CourseCardSkeleton.tsx
│   ├── blog/
│   │   └── BlogCard.tsx
│   ├── forms/
│   │   ├── Label.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── FieldError.tsx
│   │   └── FormField.tsx
│   ├── admin/.gitkeep
│   └── ui/
│       ├── Button.tsx
│       ├── Link.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Container.tsx
│       ├── Section.tsx
│       └── Icon.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── errors.ts
│   │   ├── courses.ts
│   │   └── endpoints.ts
│   ├── auth/.gitkeep
│   ├── content/
│   │   ├── home.ts
│   │   ├── schools.ts
│   │   └── stub-copy.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── format.ts
│   ├── seo.ts
│   └── validation/.gitkeep
├── hooks/
│   └── useLockedBodyScroll.ts
├── types/
│   ├── api.ts
│   ├── course.ts
│   └── nav.ts
├── public/
│   └── brand/
│       ├── logo.svg
│       └── og-default.png
├── .env.example
└── package.json
```

**Import alias:** keep `@/* → frontend/*` (default Next).

---

### 2. Design tokens (Tailwind v4)

#### 2.1 Color system

| Token | Hex | CSS variable | Tailwind usage | Role |
|-------|-----|--------------|----------------|------|
| Petrol | `#12343B` | `--color-petrol` | `bg-petrol`, `text-petrol` | Primary brand, footer bg, headings on light |
| Petrol deep | `#0C2429` | `--color-petrol-deep` | `bg-petrol-deep` | Footer bottom, hover on petrol |
| Petrol muted | `#1A4A54` | `--color-petrol-muted` | borders/icons on dark | Secondary on petrol surfaces |
| Lime | `#C7F000` | `--color-lime` | `bg-lime` | **Primary CTA fill only** (with dark text) |
| Lime bright | `#C8F13F` | `--color-lime-bright` | hover | Hover for lime buttons |
| Lime ink | `#1A2E05` | `--color-lime-ink` | `text-lime-ink` | Text on lime (contrast-safe) |
| Ground | `#F5F5F0` | `--color-ground` | `bg-ground` | Page background |
| Surface | `#FFFFFF` | `--color-surface` | `bg-surface` | Cards, header surface |
| Ink | `#14212B` | `--color-ink` | `text-ink` | Primary body/heading text |
| Ink muted | `#5C6B73` | `--color-ink-muted` | `text-ink-muted` | Secondary text |
| Line | `#D9DDD6` | `--color-line` | `border-line` | Borders/dividers |
| Danger | `#B42318` | `--color-danger` | errors | Form/API errors |

**Lime contrast / a11y (mandatory):**

- Do **not** use lime (`#C7F000`) for body text on white/ground — contrast fails WCAG for small text.
- Lime is **fill only** for primary buttons and rare accent rules (1–2px hairlines).
- Button label on lime uses `text-lime-ink` (`#1A2E05`) or darker, never white and never light petrol at small sizes without verifying contrast.
- Implementation must measure contrast: lime fill + lime-ink text ≥ **4.5:1** for normal label text (or ≥ 3:1 only if text qualifies as WCAG large text). If short, darken ink to `#0F1A03` or add a 1px petrol border; **do not** lighten lime for marketing softness.
- Secondary text on petrol: use ground/white at ≥ 4.5:1; avoid lime **text** on petrol for small labels.
- Focus rings: 2px solid petrol on light surfaces; 2px solid lime **only** on petrol surfaces where a petrol ring would disappear.

**Theme mode:** **Light only** in Phase 1. No `.dark` variant. Remove starter zinc dark palette from `globals.css`.

#### 2.2 `globals.css` structure (Tailwind v4)

```css
@import "tailwindcss";

/* next/font sets --font-display, --font-body, --font-mono on <html> */

@theme inline {
  --color-petrol: #12343b;
  --color-petrol-deep: #0c2429;
  --color-petrol-muted: #1a4a54;
  --color-lime: #c7f000;
  --color-lime-bright: #c8f13f;
  --color-lime-ink: #1a2e05;
  --color-ground: #f5f5f0;
  --color-surface: #ffffff;
  --color-ink: #14212b;
  --color-ink-muted: #5c6b73;
  --color-line: #d9ddd6;
  --color-danger: #b42318;

  --font-display: var(--font-display), "Newsreader", "Times New Roman", serif;
  --font-sans: var(--font-body), "Source Sans 3", system-ui, sans-serif;
  --font-mono: var(--font-mono), "IBM Plex Mono", ui-monospace, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;

  --leading-tight: 1.2;
  --leading-snug: 1.35;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  --spacing-section-y: 4.5rem;
  --spacing-section-y-lg: 6.5rem;
  --spacing-gutter: 1.25rem;

  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgb(20 33 43 / 0.06);
  --shadow-md: 0 4px 14px rgb(20 33 43 / 0.08);

  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
}

@layer base {
  html {
    color: var(--color-ink);
    background: var(--color-ground);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  body {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    min-height: 100dvh;
  }
  h1, h2, h3 {
    font-family: var(--font-display);
    color: var(--color-ink);
    line-height: var(--leading-tight);
    font-weight: 500;
  }
  ::selection {
    background: color-mix(in oklab, var(--color-lime) 55%, white);
    color: var(--color-ink);
  }
  :focus-visible {
    outline: 2px solid var(--color-petrol);
    outline-offset: 2px;
  }
}

/* Prefer @utility; if turbopack rejects it, use @layer components .section-y { ... } */
@utility section-y {
  padding-block: var(--spacing-section-y);
}
@utility section-y-lg {
  padding-block: var(--spacing-section-y-lg);
}
```

**Tailwind v4 / Next 16 implementation notes:**

1. Use `@import "tailwindcss"` only — no v3 `@tailwind base/components/utilities`.
2. `@theme inline` exposes utilities (`bg-petrol`, `text-ink-muted`, `font-display`, etc.). Prefer tokens over arbitrary values.
3. **next/font bridge:** In `layout.tsx`, load fonts with `variable: "--font-display"` / `"--font-body"` / `"--font-mono"`, apply those classes on `<html>`. `@theme inline` references the same CSS variable names so `font-display` utilities resolve. Do not import font objects into CSS.
4. **Self-reference caveat:** Defining `--font-display: var(--font-display), "Newsreader", ...` inside `@theme` can be circular depending on Tailwind’s flattening. **Preferred pattern:** name theme keys that read the *html* variables explicitly:

```css
@theme inline {
  --font-display: var(--font-display), "Newsreader", ui-serif, serif;
}
```

If the build emits empty font-family, switch to distinct names:

```css
/* on <html> from next/font: --font-display, --font-body, --font-mono */
@theme inline {
  --font-display: var(--font-display);
  --font-sans: var(--font-body);
  --font-mono: var(--font-mono);
}
```

…and set fallback stacks on `body` / `h1` in `@layer base` instead. **Validate in PR-1/PR-2** with computed styles.

5. Existing turbopack CSS loader stays. After token PR, run `next build`. If `@utility` fails, use plain `.section-y` under `@layer components`.
6. No `tailwind.config.ts` required for the CSS-first token path unless already present for another reason.
7. `cacheComponents` / `partialPrefetching`: **spike-gated** (see §12.6). Do not assume Next 14 fetch-cache docs.

#### 2.3 Typography scale

| Role | Family | Size / weight | Class pattern |
|------|--------|---------------|---------------|
| Display / H1 | Newsreader | clamp ~2.25–3.5rem / 500 | `font-display text-4xl md:text-5xl lg:text-6xl` |
| Section H2 | Newsreader | 1.75–2.25rem / 500 | `font-display text-3xl md:text-4xl` |
| Card H3 | Newsreader or Sans | 1.25rem / 600 | `font-display text-xl` |
| Eyebrow | Mono / Sans | 0.75–0.8125rem / 600 uppercase | `font-mono text-xs uppercase tracking-[0.14em] text-ink-muted` |
| Body | Source Sans 3 | 1rem / 400 | `font-sans text-base` |
| Small / meta | Source Sans 3 | 0.875rem | `text-sm text-ink-muted` |
| Button | Source Sans 3 | ~0.9375rem / 600 | `text-sm font-semibold` |
| Code / tools | IBM Plex Mono | 0.8125–0.875rem | `font-mono text-sm` |

**Font choice vs Geist:** Replace Geist. Newsreader supplies editorial authority for institute headlines; Source Sans 3 is highly readable for UI/body; IBM Plex Mono signals tools/specs (course codes, software names). Geist is excellent generic SaaS — wrong register here.

```tsx
import { Newsreader, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});
```

Apply: `<html className={`${display.variable} ${body.variable} ${mono.variable}`}>`.

#### 2.4 Spacing & layout rhythm

- Page gutter: `px-5 md:px-8`
- Container max: sm 640 · md 768 · lg 960 · xl 1120 · 2xl 1200 (homepage default `xl` = 1120px)
- Section vertical: mobile `py-14`–`py-16`; desktop `py-20`–`py-24`
- Card padding: `p-5 md:p-6`
- Header height: `h-16` (64px); icon buttons min 44×44
- Grid gaps: `gap-4 md:gap-6`

#### 2.5 Motion

- Default: `transition-colors` 150–200ms on buttons/links only.
- Mobile nav: CSS transform/opacity ≤ 200ms; no animation library.
- `prefers-reduced-motion: reduce` → disable non-essential transitions (nav snaps open/close).

---

### 3. Root layout

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";
import "./globals.css";
// fonts as above

export const viewport: Viewport = {
  themeColor: "#12343B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CAITECH Global Institute",
    template: "%s · CAITECH Global Institute",
  },
  description:
    "Technical institute for CAD, engineering fundamentals, electronics, ICT, and construction technology. Practical programs with industry tools — Kenya and beyond.",
  openGraph: {
    type: "website",
    siteName: "CAITECH Global Institute",
    locale: "en_KE",
    title: "CAITECH Global Institute",
    description:
      "Serious technical education in design technology, engineering, ICT, and built-environment tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAITECH Global Institute",
    description:
      "Technical programs in CAD, engineering, electronics, ICT, and construction technology.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col bg-ground font-sans text-ink antialiased">
        <SkipLink />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
```

**SkipLink:** first focusable element; visually hidden until `:focus`; targets `#main-content`.

---

### 4. Navigation config

```ts
// components/navigation/nav-config.ts
import type { NavItem } from "@/types/nav";

/** Primary desktop center nav (max ~5). */
export const primaryNav: NavItem[] = [
  { label: "Courses", href: "/courses" },
  { label: "AI Path", href: "/ai-path" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Mobile-only extras (utility + legal). */
export const mobileExtraNav: NavItem[] = [
  { label: "FAQ", href: "/faq" },
  { label: "Cart", href: "/cart" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export const authNav: NavItem[] = [
  { label: "Log in", href: "/login" },
  { label: "Register", href: "/register", emphasis: "primary" },
];

export const footerNav = {
  learn: [
    { label: "Courses", href: "/courses" },
    { label: "Categories", href: "/courses" }, // until categories index exists
    { label: "AI Learning Path", href: "/ai-path" },
    { label: "FAQ", href: "/faq" },
  ],
  institute: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  account: [
    { label: "Log in", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Cart", href: "/cart" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

/**
 * Footer contact — null means DO NOT RENDER that row.
 * Never ship placeholder emails, phones, or social URLs.
 */
export const footerContact = {
  email: null as string | null,
  phone: null as string | null,
  /** City/country only until a real address is approved. */
  locationLine: "Kenya" as string | null,
};
```

```ts
// types/nav.ts
export type NavItem = {
  label: string;
  href: string;
  emphasis?: "primary" | "default";
  external?: boolean;
};
```

---

### 5. SiteHeader

**Desktop (`md+`):** brand left · `MainNav` center · Cart + Log in + Register right (Register = `Button` sm primary).

**Mobile (`<md`):** brand left · Cart + menu button right (`aria-controls`, `aria-expanded`) · `MobileNav` drawer.

**Visual:** `bg-surface` (optional light `backdrop-blur` only if it does not become glassmorphism); `border-b border-line`; sticky `top-0 z-50`.

**Active state:** client `NavLink` + `usePathname()`; `aria-current="page"`.

**Brand lockup:**

```tsx
<Link href="/" className="flex items-baseline gap-2 no-underline">
  <span className="font-display text-lg font-medium tracking-tight text-petrol">
    CAITECH
  </span>
  <span className="hidden text-xs font-medium uppercase tracking-[0.12em] text-ink-muted sm:inline">
    Global Institute
  </span>
</Link>
```

SVG monogram optional (`public/brand/logo.svg`); text lockup is enough for PR-4.

---

### 6. MobileNav — interaction & accessibility contract (normative)

**Component type:** Client (`"use client"`). Rendered from `SiteHeader`.

#### 6.1 Open / close triggers

| Action | Behavior |
|--------|----------|
| Tap menu button | Open drawer |
| Tap close button | Close |
| Tap backdrop | Close |
| Activate any link inside drawer | Close |
| `Escape` | Close |
| Resize to `md+` while open | Close and reset state |
| `pathname` change | Close |

#### 6.2 DOM / ARIA

```tsx
<button
  type="button"
  aria-label={open ? "Close menu" : "Open menu"}
  aria-expanded={open}
  aria-controls="mobile-nav"
  onClick={toggle}
/>

<div
  id="mobile-nav"
  role="dialog"
  aria-modal="true"
  aria-label="Site menu"
  hidden={!open} // or inert when closed
>
  {/* close control + nav links */}
</div>
```

- **Closed:** drawer not focusable (`hidden` / `inert`); backdrop unmounted or non-interactive.
- **Open:** `document.body` scroll locked via `useLockedBodyScroll(open)`.

#### 6.3 Focus management

1. **On open:** remember `document.activeElement`; move focus to the **Close** control (predictable).
2. **While open:** **focus trap** inside the dialog (Tab / Shift+Tab cycle only close + links + auth CTAs).
3. **On close (same page):** restore focus to the menu button.
4. **On close via navigation:** skip restore to menu button if the page unmounted it; do not leave focus on `display:none` nodes. Close drawer in `useEffect` on `pathname` change.

#### 6.4 Motion / layout

- Panel: full-height from the right (full-screen acceptable on very small widths); transform/opacity ≤ 200ms.
- `prefers-reduced-motion: reduce`: instant open/close.
- z-index: backdrop `z-40`, drawer `z-50`, coordinated with sticky header so the menu button remains usable.

#### 6.5 Content order

1. Close control  
2. Primary nav  
3. Auth (Log in / Register)  
4. Extras (FAQ, Cart, Privacy, Terms)

#### 6.6 Testing checklist (PR-4 Done-when)

- [ ] Keyboard-only open / close / trap  
- [ ] Screen reader announces dialog  
- [ ] No background scroll when open  
- [ ] Escape closes  
- [ ] Focus never lands on hidden elements  
- [ ] axe: no critical issues on header/nav  

**Implementation sketch (not prescriptive library):** plain React state + `useEffect` for keydown/trap is enough. Do **not** add Headless UI/Radix solely for the drawer unless trap correctness becomes painful — if added, justify in PR.

---

### 7. SiteFooter

**Layout:** `bg-petrol text-ground` · generous top padding · four columns desktop (Brand+blurb, Learn, Institute, Account) · legal row with Privacy/Terms · copyright `© {year} CAITECH Global Institute`.

**Null contact rules (normative):**

| Field | Source | If null / empty |
|-------|--------|------------------|
| `footerContact.email` | `nav-config` | **Omit** the email row — no `email@…` placeholder |
| `footerContact.phone` | `nav-config` | **Omit** the phone row |
| `footerContact.locationLine` | `nav-config` | If set (default `"Kenya"`), one muted line under blurb; if null, omit |
| Social links | none | **Do not** invent Instagram / LinkedIn / X / Facebook URLs |

**Blurb (locked):**  
“CAITECH Global Institute — technical education in CAD, engineering, electronics, ICT, and construction technology.”

**Do not** list fake accreditation badges or partner marks.

---

### 8. Page container system

| Component | Props | Purpose |
|-----------|-------|---------|
| `Container` | `size?: "sm" \| "md" \| "lg" \| "xl" \| "full"`; `className?`; `as?: "div" \| "section" \| …` | Horizontal width + gutter |
| `Section` | `tone?: "ground" \| "surface" \| "petrol"`; `pad?: "md" \| "lg"`; `id?`; `className?`; `children` | Vertical section band |
| `PageHeader` | `eyebrow?`; `title: string`; `description?`; `actions?` | Stub + interior pages |

**Container max widths:** sm 640 · md 768 · lg 960 · xl 1120 · full = 100% + gutter.

```ts
// components/ui/Container.tsx
export type ContainerProps = {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  as?: "div" | "section" | "article" | "main";
  children: React.ReactNode;
};

// components/ui/Section.tsx
export type SectionProps = {
  tone?: "ground" | "surface" | "petrol";
  pad?: "md" | "lg";
  id?: string;
  className?: string;
  children: React.ReactNode;
};

// components/layout/PageHeader.tsx
export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};
```

---

### 9. UI primitives — component APIs

#### 9.1 `cn`

```ts
// lib/utils/cn.ts
// Start zero-dep. Add clsx + tailwind-merge only if class conflicts hurt.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

#### 9.2 Button

```ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant; // default "primary"
  size?: ButtonSize;       // default "md"
  href?: string;           // if set, render next/link styled as button
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;      // required effectively when icon-only
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};
```

| Variant | Look |
|---------|------|
| `primary` | `bg-lime text-lime-ink hover:bg-lime-bright` |
| `secondary` | `border border-petrol text-petrol hover:bg-petrol hover:text-ground` |
| `ghost` | text petrol, subtle hover ground |
| `inverse` | for petrol bands: ground/lime outline, text ground |
| `danger` | danger text/border |

Sizes: sm `h-9 px-3` · md `h-11 px-5` · lg `h-12 px-6`. Mobile md+ targets ≥ 44px height.

**Impl:** one file; `href` → `Link`, else `button`. No `any`. `disabled` on link variant uses `aria-disabled` + prevent default.

#### 9.3 App Link

```ts
// components/ui/Link.tsx
export type AppLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "inline" | "nav" | "quiet";
  external?: boolean;
};
```

#### 9.4 Badge

```ts
export type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "petrol" | "lime" | "outline";
  className?: string;
};
```

Lime badge = lime fill + `text-lime-ink` (same contrast rule). Sparingly (tool chips, course type).

#### 9.5 Card

```ts
export type CardProps = {
  children: React.ReactNode;
  href?: string;
  className?: string;
  padding?: "sm" | "md" | "lg";
};
```

#### 9.6 CourseCard

```ts
// types/course.ts
export type CourseCardModel = {
  id: string | number;
  slug: string;
  title: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  level?: string | null;
  categoryName?: string | null;
  priceKes?: number | null; // major units KES
  durationLabel?: string | null;
};

export type CourseCardProps = {
  course: CourseCardModel;
};
```

Render: `next/image` when URL exists else petrol placeholder; title; summary `line-clamp-2`; meta; `formatKes(priceKes)`.

```ts
// lib/utils/format.ts
export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}
```

#### 9.7 Form primitives (foundation only)

| Component | Key props |
|-----------|-----------|
| `Label` | `htmlFor`, `children`, `className?` |
| `Input` | native input props + `invalid?: boolean` |
| `Textarea` | same |
| `Select` | same |
| `FieldError` | `id?`, `children` |
| `FormField` | `label`, `htmlFor`, `error?`, `children` |

Styles: `h-11`, `border-line`, focus petrol, `aria-invalid` → danger border. **Not wired to auth in Phase 1.**

---

### 10. Homepage — section-by-section

**Composition order (locked):**

1. `HomeHero`  
2. `WhatIsSection`  
3. `SchoolsSection`  
4. `FeaturedCoursesSection`  
5. `WhySection`  
6. `PracticalSection`  
7. `AiPathTeaser`  
8. `BlogTeaser` (empty-safe)  
9. `CtaBand`  

**No** logo clouds, fake counters, testimonial carousels, purple gradients, or glassmorphism stacks.

#### 10.1 Locked copy bank

All homepage strings live in `lib/content/home.ts` and `lib/content/schools.ts`. Components import constants — **no inline marketing improvisation** in JSX.

```ts
// lib/content/home.ts
export const homeCopy = {
  hero: {
    eyebrow: "Technical education · Practical tools",
    title: "Technical skill. Built with intention.",
    lede:
      "CAITECH Global Institute trains learners in CAD, engineering fundamentals, electronics, ICT, and construction technology — programs shaped around the software, benches, and project standards used in real work.",
    primaryCta: { label: "Explore courses", href: "/courses" },
    secondaryCta: { label: "AI Learning Path", href: "/ai-path" },
    toolLine: [
      "AutoCAD",
      "Civil 3D",
      "ArchiCAD",
      "BIM",
      "Cisco",
      "Python",
      "Linux",
      "Electronics",
    ],
  },
  whatIs: {
    title: "What the institute is",
    body:
      "CAITECH is a technical institute, not a content farm. Curricula cover design technology, engineering fundamentals, repairs, data, and media systems with clear course types — diplomas, certificates, and short courses — published with pricing in KES and structured intakes.",
  },
  whyTitle: "Why CAITECH",
  why: [
    {
      title: "Tool-fluent",
      body: "From AutoCAD and Tekla to SQL, networking, and bench electronics — teaching tied to named tools and workflows.",
    },
    {
      title: "Practice-structured",
      body: "Sections, lessons, resources, and assessments arranged so progress is visible and deliverable-oriented.",
    },
    {
      title: "Built to enroll",
      body: "Public catalog, cart, and payment flows already exist on the platform — including mobile-money-oriented checkout.",
    },
  ],
  practical: {
    title: "Career-relevant practice",
    body:
      "Programs emphasize drawings you can issue, networks you can configure, boards you can diagnose, and data you can query — skills that transfer to sites, offices, and workshops.",
  },
  aiPath: {
    title: "AI Learning Path",
    body:
      "A structured route for learners who want guided progression — not a chatbot gimmick. Explore the path, then enroll in the underlying courses.",
    cta: { label: "View AI Learning Path", href: "/ai-path" },
  },
  blog: {
    title: "From the institute",
    empty: "Notes and articles will appear here when published. No filler posts.",
    cta: { label: "Blog", href: "/blog" },
  },
  featured: {
    title: "Featured courses",
    emptyTitle: "Courses loading from the catalog soon",
    emptyBody:
      "The public catalog is connected in a later pass. Browse the courses section or contact the institute in the meantime.",
    cta: { label: "All courses", href: "/courses" },
  },
  ctaBand: {
    title: "Start with a course that matches the work.",
    lede: "Browse the catalog, or contact the institute with a clear question.",
    primary: { label: "Explore courses", href: "/courses" },
    secondary: { label: "Contact", href: "/contact" },
  },
} as const;
```

```ts
// lib/content/schools.ts
export type School = { name: string; blurb: string };

export const schools: School[] = [
  {
    name: "Computer Aided Design & Technology",
    blurb: "Drafting, modeling, and documentation workflows with industry CAD platforms.",
  },
  {
    name: "Engineering Fundamental Skills",
    blurb: "Core engineering literacy for site, workshop, and design-office practice.",
  },
  {
    name: "General Electronics Repairs",
    blurb: "Diagnosis and repair habits for boards, power, and consumer/industrial electronics.",
  },
  {
    name: "Creative & Performing Arts",
    blurb: "Creative production skills adjacent to technical media pathways.",
  },
  {
    name: "ICT",
    blurb: "Systems, productivity, and infrastructure skills for modern workplaces.",
  },
  {
    name: "Design Technology",
    blurb: "Product and design-tech practice spanning drawing, making, and specification.",
  },
  {
    name: "Building Technology",
    blurb: "Built-environment methods, materials awareness, and construction-tech tools.",
  },
  {
    name: "Data Analytics",
    blurb: "SQL-first data skills and analytical workflows for operational decisions.",
  },
  {
    name: "Engineering",
    blurb: "Applied engineering tracks beyond fundamentals — discipline-specific depth.",
  },
  {
    name: "Media & Communication Technology",
    blurb: "Technical media systems, communications tooling, and production pipelines.",
  },
];
```

#### 10.2 Hero layout

- Split on `lg+`: copy left; right = **abstract technical panel** (CSS grid of tool names on petrol) — not stock “smiling students.”
- Primary CTA = lime `Button`; secondary = secondary/ghost.
- Tool line = mono outline chips (`Badge` outline).

#### 10.3 Featured courses data rules

- `page.tsx` (Server Component) calls `getFeaturedCourses({ limit: 6 })`.
- **Empty array / thrown error caught inside helper:** render empty state from `homeCopy.featured` — never infinite skeleton, never fabricated courses.
- **Success:** responsive grid of `CourseCard`.

#### 10.4 Blog teaser

- Phase 1 default: **no blog API call**. Static empty-safe teaser + link to `/blog` stub.
- Avoids blocking on unknown `site_content` shape (OQ-6).

#### 10.5 Outcomes

- Render outcomes **only** with real data. Phase 1: **omit** student-outcomes section entirely.

#### 10.6 Homepage page module

```tsx
// app/page.tsx
import { HomeHero } from "@/components/hero/HomeHero";
import { WhatIsSection } from "@/components/home/WhatIsSection";
import { SchoolsSection } from "@/components/home/SchoolsSection";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { WhySection } from "@/components/home/WhySection";
import { PracticalSection } from "@/components/home/PracticalSection";
import { AiPathTeaser } from "@/components/home/AiPathTeaser";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { CtaBand } from "@/components/home/CtaBand";
import { getFeaturedCourses } from "@/lib/api/courses";

export default async function HomePage() {
  const courses = await getFeaturedCourses({ limit: 6 });
  return (
    <>
      <HomeHero />
      <WhatIsSection />
      <SchoolsSection />
      <FeaturedCoursesSection courses={courses} />
      <WhySection />
      <PracticalSection />
      <AiPathTeaser />
      <BlogTeaser />
      <CtaBand />
    </>
  );
}
```

---

### 11. Stub pages

Shared pattern: `PageHeader` + short paragraph from `lib/content/stub-copy.ts`.

**Locked stub titles/descriptions** (metadata + H1):

| Route | Title | Description (meta + intro) |
|-------|-------|------------------------------|
| `/courses` | Courses | Browse CAITECH technical programs — CAD, engineering, ICT, electronics, and more. |
| `/courses/[slug]` | Course | Course details publish with the catalog integration. |
| `/categories/[slug]` | Category | Course categories from the CAITECH catalog. |
| `/about` | About | What CAITECH Global Institute is and how programs are structured. |
| `/ai-path` | AI Learning Path | Guided progression through technical courses — full experience in a later release. |
| `/blog` | Blog | Notes from the institute. |
| `/blog/[slug]` | Article | Institute article. |
| `/contact` | Contact | Contact CAITECH Global Institute. |
| `/faq` | FAQ | Common questions about programs, enrollment, and accounts. |
| `/login` | Log in | Access your CAITECH account. |
| `/register` | Register | Create a CAITECH account. |
| `/forgot-password` | Forgot password | Reset your password. |
| `/reset-password` | Reset password | Choose a new password. |
| `/cart` | Cart | Your selected courses. |
| `/checkout` | Checkout | Complete enrollment purchase. |
| `/payments/return` | Payment status | Payment return status. |
| `/privacy` | Privacy | Privacy policy. |
| `/terms` | Terms | Terms of use. |
| `not-found` | Page not found | That page does not exist or was moved. |

**Shared body tone:**  
“This route is live for navigation and SEO. Full UI ships in a later phase.”

Dynamic routes: valid slug params render stub; do not 404 solely because CMS is empty.

```ts
// lib/content/stub-copy.ts
export const stubBody =
  "This route is live for navigation and SEO. Full UI ships in a later phase.";

export const stubs = {
  courses: { title: "Courses", description: "Browse CAITECH technical programs — CAD, engineering, ICT, electronics, and more." },
  // ... mirror table above
} as const;
```

---

### 12. API client foundation

#### 12.1 Env

```bash
# frontend/.env.example
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No trailing slash on `NEXT_PUBLIC_API_URL`. Public catalog GETs may run server-side. **No secrets** in `NEXT_PUBLIC_*`.

#### 12.2 Endpoints map (provisional)

```ts
// lib/api/endpoints.ts
export const endpoints = {
  courses: {
    list: "/courses/",
    detail: (slug: string) => `/courses/${slug}/`,
  },
  auth: {
    login: "/auth/login/",
    register: "/auth/register/",
    refresh: "/auth/refresh/",
    me: "/auth/me/",
  },
} as const;
```

Confirm against `/api/v1/schema/` before Phase 2 UI — path names may differ.

#### 12.3 Errors

```ts
// lib/api/errors.ts
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? extractDetail(body) ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function extractDetail(body: unknown): string | undefined {
  if (body && typeof body === "object" && "detail" in body) {
    const d = (body as { detail: unknown }).detail;
    if (typeof d === "string") return d;
  }
  return undefined;
}
```

#### 12.4 `apiFetch`

```ts
// lib/api/client.ts
import { ApiError } from "./errors";

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return url.replace(/\/$/, "");
}

export type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  cache?: RequestCache;
  next?: RequestInit["next"];
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    cache: opts.cache,
    next: opts.next,
    signal: opts.signal,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
```

#### 12.5 Provisional course wire format

**Status: PROVISIONAL.** Verified contract file is empty. Normalize defensively; mark types in code comments as provisional.

```ts
// types/api.ts — PROVISIONAL until /api/v1/schema/ is captured
export type ProvisionalCourseListResponse =
  | ProvisionalCourse[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: ProvisionalCourse[];
    };

export type ProvisionalCourse = {
  id: number | string;
  slug: string;
  title: string;
  name?: string;
  summary?: string | null;
  description?: string | null;
  short_description?: string | null;
  thumbnail?: string | null;
  image?: string | null;
  cover?: string | null;
  level?: string | null;
  difficulty?: string | null;
  category?: { name?: string; title?: string } | string | null;
  price?: number | string | null;
  price_kes?: number | string | null;
  fee?: number | string | null;
  duration?: string | null;
  duration_hours?: number | null;
  is_featured?: boolean;
  featured?: boolean;
};
```

```ts
// lib/api/courses.ts
import { apiFetch } from "./client";
import { endpoints } from "./endpoints";
import type { ProvisionalCourse, ProvisionalCourseListResponse } from "@/types/api";
import type { CourseCardModel } from "@/types/course";

export function unwrapList(payload: ProvisionalCourseListResponse): ProvisionalCourse[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

export function normalizeCourseCard(raw: ProvisionalCourse): CourseCardModel | null {
  const slug = raw.slug;
  const title = raw.title ?? raw.name;
  if (!slug || !title) return null;

  const priceRaw = raw.price_kes ?? raw.price ?? raw.fee;
  const priceNum = priceRaw == null || priceRaw === "" ? NaN : Number(priceRaw);
  const categoryName =
    typeof raw.category === "string"
      ? raw.category
      : raw.category?.name ?? raw.category?.title ?? null;

  return {
    id: raw.id,
    slug,
    title,
    summary: raw.summary ?? raw.short_description ?? raw.description ?? null,
    thumbnailUrl: raw.thumbnail ?? raw.image ?? raw.cover ?? null,
    level: raw.level ?? raw.difficulty ?? null,
    categoryName,
    priceKes: Number.isFinite(priceNum) ? priceNum : null,
    durationLabel:
      raw.duration ?? (raw.duration_hours != null ? `${raw.duration_hours} hours` : null),
  };
}

export async function getFeaturedCourses(opts?: {
  limit?: number;
}): Promise<CourseCardModel[]> {
  const limit = opts?.limit ?? 6;
  try {
    const data = await apiFetch<ProvisionalCourseListResponse>(endpoints.courses.list, {
      // Final cache mode depends on §12.6 spike outcome
      next: { revalidate: 300 },
    });
    const list = unwrapList(data)
      .map(normalizeCourseCard)
      .filter((c): c is CourseCardModel => c != null);

    // Prefer is_featured when schema confirms; until then first N is OK
    const flagged = unwrapList(data).filter((r) => r.is_featured || r.featured);
    const flaggedNorm = flagged
      .map(normalizeCourseCard)
      .filter((c): c is CourseCardModel => c != null);

    return (flaggedNorm.length ? flaggedNorm : list).slice(0, limit);
  } catch {
    return [];
  }
}
```

**Honesty rule:** UI never assumes fields beyond the normalizer. OpenAPI discovery is a Phase 2 prerequisite for catalog detail.

#### 12.6 `cacheComponents` / fetch caching spike (required before production course cards)

`next.config.ts` enables `cacheComponents` (and `partialPrefetching`). Before merging live homepage course data:

| Step | Action |
|------|--------|
| 1 | Read Next **16.4.0** docs for `cacheComponents` behavior |
| 2 | Spike: RSC server-fetch `GET courses` with `next: { revalidate: 300 }` |
| 3 | Confirm `next build` + runtime (static shell vs dynamic) |
| 4 | Choose outcome A/B/C and record it |

**Decision outcomes:**

| Outcome | When | Homepage data strategy |
|---------|------|------------------------|
| **A — Compatible** | revalidate fetch works with current config | `getFeaturedCourses` in `page.tsx` with `revalidate` |
| **B — Partial** | Needs `use cache` / segment config | Follow spike’s Next 16 pattern; keep fetch in small cached helper |
| **C — Conflict** | Build fails or unsafe caching | Disable `cacheComponents` until Phase 2 **or** Phase 1 uses `cache: "no-store"` / force-dynamic **only** for the featured fetch |

**Time-box default:** If the spike cannot finish before homepage UI lands, `getFeaturedCourses` may return `[]` (empty state) and the homepage still ships. **Spike is required before showing real course cards in production.**

Write a short note: `docs/design-output/cache-components-spike.md` (or `frontend/docs/`).

---

### 13. SEO baseline

#### 13.1 Global

- `metadataBase` from `NEXT_PUBLIC_SITE_URL`
- Title template `%s · CAITECH Global Institute`
- `lang="en-KE"`
- `app/robots.ts`: allow public marketing routes; disallow `/admin`, `/cart`, `/checkout`, `/payments/`
- `app/sitemap.ts`: `/`, `/about`, `/courses`, `/contact`, `/faq`, `/ai-path`, `/blog`, `/privacy`, `/terms`, `/login`, `/register`

#### 13.2 Per-route metadata table

| Route | `title` | `description` | Index |
|-------|---------|---------------|-------|
| `/` | default site title | institute positioning (layout default) | yes |
| `/courses` | Courses | stub table | yes |
| `/courses/[slug]` | Course (or title later) | stub | yes |
| `/categories/[slug]` | Category | stub | yes |
| `/about` | About | stub | yes |
| `/ai-path` | AI Learning Path | stub | yes |
| `/blog`, `/blog/[slug]` | Blog / Article | stub | yes |
| `/contact` | Contact | stub | yes |
| `/faq` | FAQ | stub | yes |
| `/privacy`, `/terms` | Privacy / Terms | stub | yes |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | stub titles | stub | **noindex** |
| `/cart`, `/checkout`, `/payments/return` | stub titles | stub | **noindex** |
| `not-found` | Page not found | — | noindex |

```ts
// lib/seo.ts
import type { Metadata } from "next";

export function stubMetadata(
  title: string,
  description: string,
  opts?: { index?: boolean },
): Metadata {
  const index = opts?.index ?? true;
  return {
    title,
    description,
    robots: index ? undefined : { index: false, follow: false },
    openGraph: { title, description },
  };
}
```

#### 13.3 JSON-LD

Organization JSON-LD on homepage **only** if real contact fields exist. With `footerContact.email/phone` null, **skip** JSON-LD to avoid fake `PostalAddress`.

---

### 14. Accessibility baseline

- Skip link; one `h1` per page; logical heading order  
- Color contrast per lime rules §2.1  
- `:focus-visible` on all interactive elements  
- MobileNav contract §6 (normative)  
- Native elements (`button`, `a`, `nav`, `main`, `header`, `footer`)  
- Images: meaningful `alt`; decorative empty `alt`  
- Form controls always labeled  
- Hit targets ≥ 44×44px on mobile nav/buttons  
- Manual keyboard pass + axe on home + one stub before Phase 1 close  

---

### 15. Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Hamburger; single-column sections; courses 1 col |
| `md` | Horizontal nav; courses 2 col; schools 2 col |
| `lg+` | courses 3 col; schools 3–5 col; hero split |

No horizontal scroll. Sticky header must not obscure skip-link target (anchor offset / scroll-margin on `#main-content`).

---

### 16. Performance budget (Phase 1)

- RSC default; client islands: `MobileNav`, active `NavLink`, body scroll lock only  
- `next/image` for thumbnails when URLs exist  
- No chart/animation libraries  
- Fonts: three families, latin subset, `display: swap`  
- Homepage JS minimal  

---

### 17. Exact file list (create / modify)

**Modify**

- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/next.config.ts` — only if spike requires cache flag change
- `frontend/package.json` — only if adding optional `clsx` / `tailwind-merge`
- `frontend/.env.example` (create if missing)

**Create** — every path under §1 folder architecture not already present (`components/**`, `lib/**`, `hooks/**`, `types/**`, `public/brand/**`, all route stubs, `not-found.tsx`, `robots.ts`, `sitemap.ts`).

**Do not** delete backend packages or restart the monorepo.

---

## Alternatives Considered

| Alternative | Why rejected / deferred |
|-------------|-------------------------|
| Keep Geist fonts | Generic SaaS register; fails institute/editorial north star |
| shadcn/ui full kit | Heavy surface + default aesthetics fight brand; hand-roll fewer primitives |
| Dark mode first | Brand specified warm paper + petrol; dark deferred |
| CS-only homepage (no API) | Acceptable fallback; prefer thin client + empty state so Phase 2 is not a rewrite |
| Framer Motion mega-hero | Violates performance + restraint |
| Fabricate full API contract | Empty verified doc — provisional normalizer only |
| Blindly disable Next experimental flags | Spike first; delete only on conflict (outcome C) |
| Radix dialog by default for mobile nav | Optional if hand trap fails; not required to start |

---

## Key Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Light-only theme** with petrol / lime / ground tokens in Tailwind v4 `@theme inline` | Matches mandatory brand; avoids dual-theme delay |
| 2 | **Replace Geist** with Newsreader + Source Sans 3 + IBM Plex Mono via `next/font` | Editorial + technical register; CSS variables bridged into `@theme` |
| 3 | **Hand-rolled UI primitives** (no shadcn/MUI) | Brand control, fewer deps, enough for shell |
| 4 | **Lime = primary CTA fill only**; text on lime uses `lime-ink`; no lime small text on white | WCAG contrast; accent restraint |
| 5 | **Server Components default**; client only for MobileNav, active NavLink, body scroll lock | Performance + Next 16 norms |
| 6 | **Static schools + locked copy modules** (`lib/content/*`) | Real institute areas; no CMS dependency in Phase 1; prevents copy drift |
| 7 | **No fake social proof** | Trust; design north star |
| 8 | **Thin API client + provisional normalizer**; empty contract honesty | Unblocks featured strip without lying about schema |
| 9 | **Featured courses fail open → `[]` empty state** | Homepage never crashes when API/env down |
| 10 | **MobileNav is a modal dialog** with focus trap, Escape, restore, ARIA per §6 | A11y is design scope, not a QA afterthought |
| 11 | **Footer contact null rules** — omit empty email/phone; no fake social | Prevents placeholder rot |
| 12 | **`cacheComponents` spike-gated** before production course cards (outcomes A/B/C) | Next 16 config may interact with fetch caching |
| 13 | **Stub all public routes in Phase 1** with locked meta copy | Nav/footer never 404; SEO baseline |
| 14 | **Auth/cart/blog/AI Path full UI deferred** | Hard phase boundary |
| 15 | **KES `formatKes` helper** | Kenya-oriented pricing when price present |
| 16 | **Optional `clsx` + `tailwind-merge`** only if `cn` conflicts hurt | Prefer zero extra deps |
| 17 | **Blog teaser: no API in Phase 1** | `site_content` shape unknown |
| 18 | **PR order: tokens → fonts/layout → primitives → header/footer → stubs/SEO → API+spike → homepage → polish** | Each PR reviewable; homepage after foundations |
| 19 | **Skip Organization JSON-LD while contact nulls** | Avoid publishing fabricated structured data |
| 20 | **Categories footer link → `/courses` until categories index exists** | No dead-end IA |

---

## Open Questions

| ID | Question | Default if unresolved | Phase |
|----|----------|----------------------|-------|
| OQ-1 | Exact courses list/detail field names from `/api/v1/schema/` | Provisional normalizer §12.5 | Phase 2 / spike |
| OQ-2 | Featured flag query param vs client filter | Client filter / first N | Phase 2 |
| OQ-3 | Real public email/phone for footer | Omit until provided (`null`) | Product |
| OQ-4 | Final logo SVG vs text lockup | Text lockup | Design asset |
| OQ-5 | `cacheComponents` keep or disable | Spike §12.6; fail open empty courses | Phase 1 spike |
| OQ-6 | Blog/posts endpoint shape | No home blog fetch | Phase 2 |
| OQ-7 | Categories index route vs only `/categories/[slug]` | Footer → `/courses` | Phase 2 |
| OQ-8 | Production `NEXT_PUBLIC_SITE_URL` | Set in deploy env | Ops |
| OQ-9 | Whether `@theme` font variable self-reference needs split names | Validate computed font-family in PR-2 | Phase 1 impl |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Empty API contract → wrong fields | Provisional normalizer; skip malformed rows; schema discovery task |
| `cacheComponents` breaks dynamic fetch | Spike + A/B/C; empty-state fallback |
| Lime contrast failure | Token `lime-ink`; measure in polish PR; darken ink if needed |
| Mobile nav a11y bugs | Normative §6 + checklist in PR-4 Done-when |
| Scope creep into catalog/auth | Non-goals + PR boundaries |
| Font loading CLS | `next/font` + `display: swap` |
| Stub pages look abandoned | Shared `PageHeader` + honest one-liner |
| Env missing in preview | `getFeaturedCourses` → `[]`; `.env.example` documented |
| `@utility` unsupported in pipeline | Fallback plain CSS classes |
| Circular font CSS variables | OQ-9 validation; fallback stacks in base layer |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| `next build` | Passes |
| Visual brand | Petrol/lime/ground recognizable on first screen |
| Lighthouse a11y (home) | ≥ 95 or no serious axe violations |
| Lighthouse perf (home, mobile) | No severe regression vs starter; aim ≥ 90 when hosting allows |
| CLS | < 0.1 home |
| Nav | All primary/footer hrefs resolve (stubs OK) |
| API down | Home still HTTP 200 with empty featured state |
| Mobile nav | §6.6 checklist complete |
| Engineer clarity | Tokens, nav a11y, and API provisional types implementable without redesign |

**Qualitative Done-when:** a prospective learner can explain what CAITECH teaches after one homepage scroll.

---

## PR Plan

Each PR is independently reviewable and mergeable. **Dependencies are hard ordering.**

### PR-1 — Design tokens & global base styles

- **Title:** `design(frontend): CAITECH color/type tokens in Tailwind v4`
- **Files:** `frontend/app/globals.css`
- **Depends on:** none
- **Changes:** Replace starter/zinc dark palette with `@theme inline` colors (including `lime-ink`), type scale, radius, shadows, base element styles, selection, focus-visible, section spacing utilities; comment block for lime contrast rules
- **Done-when:** `bg-petrol`, `bg-lime`, `text-ink`, `bg-ground` utilities render; `next build` parses CSS

### PR-2 — Fonts, root layout shell, SkipLink

- **Title:** `feat(frontend): root layout with Newsreader/Source Sans 3/IBM Plex Mono`
- **Files:** `frontend/app/layout.tsx`, `frontend/components/layout/SkipLink.tsx`
- **Depends on:** PR-1
- **Changes:** `next/font` variables on `<html>`; real metadata/viewport; `main#main-content`; remove Geist; flex column shell (header/footer can wait for PR-4 placeholders)
- **Done-when:** Build pass; computed styles show intended families (validate OQ-9); skip link works with keyboard

### PR-3 — UI primitives

- **Title:** `feat(frontend): Button, Link, Badge, Card, Container, Section, form baselines`
- **Files:** `frontend/components/ui/*`, `frontend/components/forms/*`, `frontend/lib/utils/cn.ts`, `frontend/lib/utils/format.ts`
- **Depends on:** PR-1 (PR-2 ideal)
- **Changes:** Implement props per §9; `formatKes`; no feature pages yet
- **Done-when:** Typecheck clean; primary button uses lime + lime-ink

### PR-4 — SiteHeader, MobileNav, SiteFooter, nav-config

- **Title:** `feat(frontend): institutional header, accessible mobile nav, footer`
- **Files:** `frontend/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `frontend/components/navigation/*`, `frontend/types/nav.ts`, `frontend/hooks/useLockedBodyScroll.ts`, wire into `layout.tsx`
- **Depends on:** PR-2, PR-3
- **Changes:** Full §5–§7 including **MobileNav a11y contract §6**; footer null contact rules; sticky header
- **Done-when:** §6.6 checklist manually verified; desktop + mobile match `nav-config`

### PR-5 — Public route stubs + SEO robots/sitemap

- **Title:** `feat(frontend): public route stubs and SEO baseline`
- **Files:** all stub `frontend/app/**/page.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`, `lib/content/stub-copy.ts`, `lib/seo.ts`, `components/layout/PageHeader.tsx`
- **Depends on:** PR-2, PR-4
- **Changes:** Locked titles/descriptions §11 + §13 table; noindex on auth/cart/checkout; sitemap entries
- **Done-when:** Every nav/footer href returns 200; metadata spot-checked

### PR-6 — API client foundation + cacheComponents spike

- **Title:** `feat(frontend): API client skeleton, provisional course normalizer, cache spike`
- **Files:** `frontend/lib/api/*`, `frontend/types/api.ts`, `frontend/types/course.ts`, `frontend/.env.example`, `docs/design-output/cache-components-spike.md`, possible `next.config.ts`
- **Depends on:** none for pure client code; **homepage live data depends on spike conclusion**
- **Changes:** `apiFetch`, errors, endpoints, `getFeaturedCourses` fail-open; spike note with outcome A/B/C
- **Done-when:** Normalizer handles array + `{results}`; build green; spike documented

### PR-7 — Homepage flagship

- **Title:** `feat(frontend): CAITECH homepage sections and locked copy`
- **Files:** `frontend/app/page.tsx`, `components/hero/*`, `components/home/*`, `components/courses/CourseCard.tsx`, `lib/content/home.ts`, `lib/content/schools.ts`
- **Depends on:** PR-3, PR-4, PR-6 (empty-data path acceptable)
- **Changes:** All sections §10; featured from API or empty state; no fake outcomes
- **Done-when:** Visual review vs north star; empty API OK; single `h1`; CTAs route correctly

### PR-8 — Polish, a11y pass, contrast verify

- **Title:** `chore(frontend): Phase 1 polish — a11y, contrast, meta, empty states`
- **Files:** touch-ups across shell/home as needed
- **Depends on:** PR-7
- **Changes:** axe/keyboard pass; lime contrast fix if measured short; reduced-motion; favicon/OG if assets ready
- **Done-when:** Success metrics checklist signed off

### Later-phase stubs (roadmap only — not full specs)

| Future series | Scope |
|---------------|-------|
| Phase 2 | Courses list/detail/categories against verified OpenAPI; replace provisional types |
| Phase 3 | Auth pages + JWT session strategy |
| Phase 4 | Cart/checkout/M-Pesa return |
| Phase 5 | Blog + contact forms against site_content |
| Phase 6 | AI Path product UI |
| Phase 7 | Admin `/admin/*` |

---

## Revision history

| Rev | Notes |
|-----|-------|
| 1 | Initial implementation-ready Phase 1 doc |
| 2 | Design review response: MobileNav a11y contract; provisional API wire format + normalizer; cacheComponents spike gate (A/B/C); PR order corrected (homepage after API/foundation); locked hero/stub copy modules; footer null rules; lime contrast + lime-ink token; SEO per-route table; Key Decisions expanded; component prop tables; Tailwind v4 / next/font / `@theme` notes; blog teaser no-API default |

---

*End of Phase 1 design document.*
