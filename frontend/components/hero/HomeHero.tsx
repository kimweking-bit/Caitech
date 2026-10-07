import { hero } from "@/lib/content/stub-copy";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-ground">
      {/* Architectural frame — restrained geometric accent, not decoration spam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 lg:block"
      >
        <div className="absolute inset-0 bg-[linear-gradient(160deg,transparent_0%,rgb(18_52_59/0.04)_40%,rgb(199_240_0/0.08)_100%)]" />
        <div className="absolute right-12 top-16 h-40 w-px bg-line" />
        <div className="absolute right-12 top-16 h-px w-40 bg-line" />
        <div className="absolute bottom-20 right-24 h-24 w-24 border border-petrol/15" />
      </div>

      <Container className="relative py-16 md:py-24 lg:py-28">
        <div className="max-w-3xl">
          <Eyebrow className="mb-5 text-petrol/70">{hero.eyebrow}</Eyebrow>

          <div className="hairline-lime mb-6" aria-hidden />

          <h1 className="font-display text-[2.35rem] leading-[1.12] text-petrol text-balance sm:text-5xl md:text-6xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
            {hero.lede}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={hero.primaryCta.href} variant="lime" size="lg">
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* Technical meta strip */}
        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          <span>CAD · BIM · Engineering</span>
          <span>ICT · Networks · Data</span>
          <span>Electronics · Construction tech</span>
        </div>
      </Container>
    </section>
  );
}
