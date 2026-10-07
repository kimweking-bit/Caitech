# Design Doc Re-Review — Round 2
**Date:** 2026-03-22  
**Document:** `docs/design-output/design-doc-f7d1f8a3.md` (Revision 2 — post design review)  
**Also:** `%TEMP%/grok-kimwe/grok-design-doc-f7d1f8a3.md`  
**Reviewer:** design-doc-reviewer (independent re-read of revised doc)  
**Verdict:** PASS with 0 open issues

## Open issue counts
critical: 0  
major: 0  
minor: 0  
nit: 0  
total open: 0

## Issues
None. Document is implementation-ready for Phase 1.

## Verification notes
Independent re-read of Revision 2 against prior critical/major themes. Prior Round 1 findings are **not** re-listed; this section records only whether the revised text fully closes them.

| Theme | Verified in revised doc? | Evidence |
|-------|--------------------------|----------|
| MobileNav contract present and complete? | **Yes** | §6 normative: open/close triggers (button, backdrop, link, Escape, resize `md+`, pathname); ARIA (`aria-expanded`, `aria-controls`, `role="dialog"`, `aria-modal`, `aria-label`); closed = not focusable (`hidden`/`inert`); body scroll lock; focus on open → Close, trap while open, restore on same-page close, safe pathname-close; motion ≤200ms + `prefers-reduced-motion`; z-index backdrop/drawer; content order; PR-4 Done-when checklist |
| Provisional API + cacheComponents spike specified? | **Yes** | §12.2 endpoints map; §12.3–12.5 `CourseCardModel`, field aliases, `normalizeCourse` skip rules, `getFeaturedCourses`; §12.6 spike steps + outcomes A/B/C (keep / disable flags / dynamic featured only); fail-open empty featured; no fake cards |
| Hero copy locked? | **Yes** | §10.1 `lib/content/home.ts` **LOCKED** strings: eyebrow, headline, subhead, primary/secondary CTAs, trust line; WhatIs / Schools / Why / CtaBand locked; composition order locked; Outcomes omitted until real metrics |
| Footer null rules? | **Yes** | `footerContact.email` / `phone` = `null` → do not render row; never ship placeholder contact/social; `locationLine: "Kenya"` only; social omit until URLs; KD-19 skip Organization JSON-LD while contact nulls |
| PR plan order fixed? | **Yes** | § Implementation PRs: PR-1 tokens → PR-2 fonts/layout/SkipLink → PR-3 UI primitives → PR-4 Header/MobileNav/Footer → PR-5 stubs+SEO → **PR-6 API client + cacheComponents spike** → **PR-7 Homepage** → PR-8 polish; homepage explicitly after foundation/spike |
| Key Decisions complete? | **Yes** | Expanded table (KD-1…20): tokens, lime-ink, IA, shell, stubs, provisional API, spike gate, locked copy, footer nulls, no blog API on home, no fake outcomes, skip JSON-LD, categories→`/courses`, etc. |
| Prop tables / Tailwind v4 notes / SEO / lime contrast? | **Yes** | §9 component props (Button/Link/Badge/Card/form/PageHeader); §2 Tailwind v4 `@theme inline`, next/font wiring, `@utility` fallback, OQ-9 font self-ref validate in PR-2; §13–14 robots/sitemap + per-route title/description/index table; §2.1 lime = CTA fill only, `text-lime-ink`, measure ≥4.5:1, darken ink if short |
| Phase 1 scope held? | **Yes** | Goals/Non-goals; Phase 2 explicitly courses list/detail/categories against verified OpenAPI; no auth flows, no mega-motion, no fabricated stats |
| Anti-slop / no fake data? | **Yes** | Empty featured state OK; skip malformed API rows; no lorem/placeholder emails; no fake student outcomes; blog teaser omitted without API; stub routes get honest short copy + metadata |

**Additional checks (not prior blockers, confirmed clean enough for Phase 1):**
- IA + `nav-config` with active states; Categories footer → `/courses` until real index (KD-20 / OQ-7).
- Stub public routes listed with SEO indexing table; `not-found`, `robots.ts`, `sitemap.ts`.
- Risks & mitigations + Open Questions table with defaults (OQ-1…9) — none block starting PR-1.
- Success metrics / a11y expectations include keyboard+axe and lime contrast verify in PR-8.

## Residual risks (informational, NOT open issues unless blocking)
These are accepted, documented uncertainties—not gaps in the design doc:

1. **Live OpenAPI ≠ provisional aliases** — Normalizer + skip-invalid + schema discovery task (OQ-1); empty featured is an allowed Phase 1 outcome.
2. **`cacheComponents` / `partialPrefetching` interaction** — Explicit spike in PR-6 with recorded A/B/C; do not merge homepage data assumptions before spike notes.
3. **`@theme` / next/font variable self-reference** — OQ-9; validate computed `font-family` in PR-2; split token names if needed.
4. **Lime contrast on real pixels** — Token + rules are specified; final WCAG measure is PR-8 Done-when (darken `--color-lime-ink` if short).
5. **Product-owned assets** — Real email/phone (OQ-3), final logo SVG (OQ-4), production `NEXT_PUBLIC_SITE_URL` (OQ-8) remain outside Phase 1 engineering; null/omit paths are specified.
6. **Categories IA** — Footer dual-label to `/courses` is intentional until Phase 2 index; avoid inventing `/categories` list page in Phase 1.

None of the above require further design-doc revision before implementation.

## Round 2 decision
**PASS — 0 open issues.** Revision 2 fully addresses Round 1 blocking themes with normative contracts, locked copy, spike-gated data strategy, and a dependency-correct PR sequence. Engineers can execute PR-1 through PR-8 without further design clarification for Phase 1 scope.

## End of review
