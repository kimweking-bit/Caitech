import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCta() {
  return (
    <section className="border-t border-line bg-petrol py-16 md:py-20">
      <Container>
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
              Next step
            </p>
            <h2 className="mt-3 font-display text-3xl text-ground text-balance md:text-5xl">
              Build skills that move with you.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ground/75 md:text-lg">
              Explore technical programmes built around practical skills, modern
              tools and work that has a place in the real world.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col xl:flex-row lg:justify-end">
            <Button href="/courses" variant="lime" size="lg">
              Explore courses →
            </Button>
            <Button
              href="/contact"
              variant="secondary"
              size="lg"
              className="border-ground/30 text-ground hover:border-lime hover:bg-transparent hover:text-lime"
            >
              Visit CAITECH →
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
