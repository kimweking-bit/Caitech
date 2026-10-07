import Image from "next/image";
import { hero } from "@/lib/content/stub-copy";
import { homeImages } from "@/lib/content/institute";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Full-bleed editorial homepage hero.
 * Photograph is the stage; copy sits left over a controlled gradient overlay.
 * Image layer stays fully opaque — readability comes only from .home-hero__scrim.
 */
export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-heading">
      <div className="home-hero__media" aria-hidden={false}>
        <Image
          src={homeImages.hero.src}
          alt={homeImages.hero.alt}
          fill
          priority
          fetchPriority="high"
          quality={90}
          sizes="100vw"
          className="home-hero__img"
        />
        <div className="home-hero__scrim" aria-hidden="true" />
      </div>

      <Container className="home-hero__inner" width="xl">
        <div className="home-hero__copy">
          <Eyebrow className="home-hero__eyebrow">{hero.eyebrow}</Eyebrow>
          <span className="home-hero__rule" aria-hidden="true" />

          <h1 id="home-hero-heading" className="home-hero__title">
            {hero.title}
          </h1>

          <p className="home-hero__lede">{hero.lede}</p>

          <div className="home-hero__actions">
            <Button
              href={hero.primaryCta.href}
              variant="lime"
              size="lg"
              className="home-hero__btn home-hero__btn--primary"
            >
              {hero.primaryCta.label}
            </Button>
            <Button
              href={hero.secondaryCta.href}
              variant="secondary"
              size="lg"
              className="home-hero__btn home-hero__btn--secondary"
            >
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <footer className="home-hero__foot">
          <p className="home-hero__meta">
            {hero.meta.map((item, i) => (
              <span key={item}>
                {i > 0 ? (
                  <span className="home-hero__meta-sep" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <span>{item}</span>
              </span>
            ))}
          </p>
          <p className="home-hero__figure">{hero.figureLabel}</p>
        </footer>
      </Container>
    </section>
  );
}
