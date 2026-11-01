import Image from "next/image";
import { hero } from "@/lib/content/stub-copy";
import { homeImages } from "@/lib/content/institute";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Photography-led cinematic hero.
 * Dark gradient scrim (not white wash) so the lab photograph stays visible
 * while type remains AA-readable.
 */
export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-heading">
      <div className="home-hero__media relative" aria-hidden="true">
        <Image
          src={homeImages.hero.src}
          alt={homeImages.hero.alt || ""}
          fill
          priority
          sizes="100vw"
          className="home-hero__img"
        />
      </div>

      {/* Dark cinematic scrim — keeps photography legible, not bleached */}
      <div className="home-hero__scrim" aria-hidden="true" />

      <Container className="home-hero__inner relative z-10">
        <div className="home-hero__copy">
          <Eyebrow className="home-hero__eyebrow">{hero.eyebrow}</Eyebrow>
          <span className="home-hero__rule" aria-hidden="true" />

          <h1 id="home-hero-heading" className="home-hero__title">
            {hero.title}
          </h1>

          <p className="home-hero__lede">{hero.lede}</p>

          <div className="home-hero__actions">
            <Button href={hero.primaryCta.href} variant="lime" className="home-hero__btn">
              {hero.primaryCta.label}
            </Button>
            <Button
              href={hero.secondaryCta.href}
              variant="ghost"
              className="home-hero__btn home-hero__btn--secondary"
            >
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <div className="home-hero__foot">
          <p className="home-hero__meta">
            {hero.meta.map((item, i) => (
              <span key={item}>
                {i > 0 ? <span className="home-hero__meta-sep" aria-hidden="true">
                  ·
                </span> : null}
                {item}
              </span>
            ))}
          </p>
          <p className="home-hero__figure">{hero.figureLabel}</p>
        </div>
      </Container>
    </section>
  );
}
