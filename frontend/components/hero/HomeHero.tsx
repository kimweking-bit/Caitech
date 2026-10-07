import Image from "next/image";
import { hero } from "@/lib/content/stub-copy";
import { homeImages } from "@/lib/content/institute";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-ground">
      <Container className="relative py-12 md:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Editorial copy */}
          <div className="lg:col-span-6 xl:col-span-5">
            <Eyebrow className="mb-5 text-petrol/70">{hero.eyebrow}</Eyebrow>
            <div className="hairline-lime mb-6" aria-hidden />

            <h1 className="font-display text-[2.25rem] leading-[1.12] text-petrol text-balance sm:text-5xl lg:text-[3.15rem]">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              {hero.lede}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={hero.primaryCta.href} variant="lime" size="lg">
                {hero.primaryCta.label}
              </Button>
              <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
                {hero.secondaryCta.label}
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              <span>CAD · BIM · Engineering</span>
              <span>ICT · Data · Electronics</span>
              <span>Nairobi CBD</span>
            </div>
          </div>

          {/* Visual centerpiece — framed photograph */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              {/* Technical corner marks */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-3 -top-3 h-8 w-8 border-l border-t border-petrol/40"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-3 h-8 w-8 border-r border-t border-petrol/40"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-3 -left-3 h-8 w-8 border-b border-l border-petrol/40"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-3 -right-3 h-8 w-8 border-b border-r border-petrol/40"
              />

              <figure className="relative aspect-[4/3] overflow-hidden border border-line bg-petrol/5">
                <Image
                  src={homeImages.hero.src}
                  alt={homeImages.hero.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-petrol/50 via-transparent to-transparent"
                />

                {/* Metadata strip on image */}
                <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap gap-x-5 gap-y-1 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ground/90 sm:px-5">
                  <span className="text-lime">Nairobi CBD</span>
                  <span>Technical training</span>
                  <span>Practice-led</span>
                </figcaption>
              </figure>

              {/* Side annotation */}
              <p
                aria-hidden
                className="mt-3 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted lg:block"
              >
                Fig. 01 — Lab practice · Workstation environment
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
