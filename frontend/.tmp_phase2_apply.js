const fs = require("fs");

const cssPath = "frontend/app/globals.css";
let t = fs.readFileSync(cssPath, "utf8");

const lightHeroCore = `
.home-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: clamp(28rem, 56vw, 40.5rem);
  max-height: 42.5rem;
  overflow: hidden;
  color: var(--color-ink);
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      var(--color-canvas) 55%,
      color-mix(in oklab, var(--color-brand-blue) 6%, var(--color-canvas)) 100%
    );
}

.home-hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  isolation: isolate;
}

.home-hero__img {
  object-fit: cover;
  object-position: 58% 38%;
  opacity: 1 !important;
  filter: none !important;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.home-hero__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 55% 45% at 88% 18%,
      color-mix(in oklab, var(--color-brand-blue) 14%, transparent) 0%,
      transparent 55%
    ),
    linear-gradient(
      100deg,
      #ffffff 0%,
      color-mix(in oklab, #ffffff 92%, transparent) 18%,
      color-mix(in oklab, var(--color-canvas) 78%, transparent) 34%,
      color-mix(in oklab, var(--color-canvas) 35%, transparent) 52%,
      color-mix(in oklab, var(--color-canvas) 8%, transparent) 68%,
      transparent 82%
    );
}

.home-hero__scrim::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 18%;
  background: linear-gradient(
    0deg,
    color-mix(in oklab, var(--color-canvas) 55%, transparent) 0%,
    transparent 100%
  );
}

.home-hero__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1 1 auto;
  width: 100%;
  padding-block: clamp(2.75rem, 5.5vw, 4rem) clamp(2.35rem, 4.2vw, 3.35rem);
}

.home-hero__copy {
  max-width: 34rem;
  padding-bottom: clamp(2.15rem, 3.8vw, 3.1rem);
}

.home-hero__eyebrow {
  color: var(--color-brand-blue) !important;
}

.home-hero__rule {
  display: block;
  width: 3.25rem;
  height: 2px;
  margin-block: 0.85rem 1.15rem;
  background: linear-gradient(
    90deg,
    var(--color-brand-blue) 0%,
    color-mix(in oklab, var(--color-brand-blue) 35%, var(--color-gold)) 100%
  );
  box-shadow: 0 0 18px color-mix(in oklab, var(--color-brand-blue) 28%, transparent);
}

.home-hero__title {
  margin: 0;
  max-width: 18ch;
  font-family: var(--font-display), "Newsreader", serif;
  font-size: clamp(2.5rem, 4.4vw + 0.6rem, 4.5rem);
  font-weight: 500;
  line-height: 1.04;
  letter-spacing: -0.03em;
  color: var(--color-navy);
  text-wrap: balance;
}

.home-hero__lede {
  margin: 1.05rem 0 0;
  max-width: min(33.5rem, 560px);
  width: 100%;
  font-size: clamp(0.98rem, 1.1vw, 1.08rem);
  line-height: 1.55;
  color: var(--color-ink-2);
  text-wrap: pretty;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 0.85rem;
  margin-top: 1.55rem;
}

.home-hero__btn {
  min-height: 3rem;
  padding-inline: 1.35rem;
}

.home-hero__btn--secondary {
  color: var(--color-navy) !important;
  border-color: color-mix(in oklab, var(--color-navy) 22%, transparent) !important;
  background: color-mix(in oklab, #ffffff 82%, transparent) !important;
}

.home-hero__btn--secondary:hover {
  border-color: color-mix(in oklab, var(--color-brand-blue) 55%, transparent) !important;
  background: #ffffff !important;
  color: var(--color-brand-blue) !important;
}

.home-hero__btn--secondary:focus-visible {
  outline-color: var(--color-brand-blue) !important;
}

.home-hero__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  padding-top: 0.85rem;
  border-top: 1px solid color-mix(in oklab, var(--color-navy) 12%, transparent);
}

.home-hero__meta,
.home-hero__figure {
  margin: 0;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}

.home-hero__meta-sep {
  margin-inline: 0.45rem;
  opacity: 0.55;
}

.home-hero__figure {
  color: var(--color-ink-3);
}
`;

const coreStart = t.indexOf("\n.home-hero {\n");
const tabletComment = t.indexOf("\n/* ---- Tablet", coreStart);
if (coreStart < 0 || tabletComment < 0) {
  console.error("hero markers missing", coreStart, tabletComment);
  process.exit(1);
}
t = t.slice(0, coreStart) + "\n" + lightHeroCore + t.slice(tabletComment);

// Lighten remaining petrol-deep scrims in hero media queries only if still present
t = t.replace(
  /\.home-hero__scrim \{[\s\S]*?color-mix\(in oklab, var\(--color-petrol-deep\)[\s\S]*?\}/g,
  (block) =>
    block
      .replaceAll("var(--color-petrol-deep)", "var(--color-canvas)")
      .replaceAll("90%", "92%")
      .replaceAll("70%", "55%")
      .replaceAll("26%", "12%"),
);

const catCss = `
/* ---- Homepage category discovery (Phase 2) -------------------------- */

.home-categories {
  background: var(--color-canvas);
}

.home-categories__header {
  max-width: 40rem;
  margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
}

.home-categories__title {
  margin: 0.65rem 0 0;
  font-family: var(--font-display), "Newsreader", serif;
  font-size: clamp(1.75rem, 2.4vw + 0.6rem, 2.35rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-navy);
  text-wrap: balance;
}

.home-categories__lede {
  margin: 0.75rem 0 0;
  max-width: 36rem;
  font-size: 1.02rem;
  line-height: 1.55;
  color: var(--color-ink-2);
}

.home-categories__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 480px) {
  .home-categories__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .home-categories__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .home-categories__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.home-categories__card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.1rem;
  min-height: 7.5rem;
  height: 100%;
  padding: 1.15rem 1.2rem 1.2rem;
  border-radius: 0.85rem;
  border: 1px solid color-mix(in oklab, var(--color-navy) 10%, transparent);
  background: #ffffff;
  box-shadow: 0 1px 2px color-mix(in oklab, var(--color-navy) 4%, transparent);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.home-categories__card:hover {
  border-color: color-mix(in oklab, var(--color-brand-blue) 45%, transparent);
  box-shadow:
    0 8px 24px color-mix(in oklab, var(--color-brand-blue) 10%, transparent),
    0 1px 2px color-mix(in oklab, var(--color-navy) 4%, transparent);
  transform: translateY(-1px);
}

.home-categories__card:focus-visible {
  outline: 2px solid var(--color-brand-blue);
  outline-offset: 3px;
}

.home-categories__name {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-navy);
  text-wrap: balance;
}

.home-categories__card:hover .home-categories__name {
  color: var(--color-brand-blue);
}

.home-categories__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-brand-blue);
}

.home-categories__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1.25rem;
  margin-top: clamp(1.5rem, 3vw, 2.15rem);
  padding-top: 1.25rem;
  border-top: 1px solid color-mix(in oklab, var(--color-navy) 10%, transparent);
}

.home-categories__fallback {
  margin: 0;
  color: var(--color-ink-2);
  font-size: 0.98rem;
  line-height: 1.5;
}
`;

if (!t.includes(".home-categories {")) {
  t = t.trimEnd() + "\n" + catCss + "\n";
}

fs.writeFileSync(cssPath, t);
console.log("css ok", {
  brand: /--color-brand-blue: #[0-9a-fA-F]+/.exec(t)?.[0],
  canvas: /--color-canvas: #[0-9a-fA-F]+/.exec(t)?.[0],
  ground: /--color-ground: #[0-9a-fA-F]+/.exec(t)?.[0],
  categories: t.includes(".home-categories__card"),
});
