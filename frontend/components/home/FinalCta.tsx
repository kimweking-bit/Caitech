import { finalCta } from "@/lib/content/stub-copy";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCta() {
  return (
    <section className="border-t border-line bg-petrol py-16 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl text-ground text-balance md:text-4xl">
            {finalCta.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ground/75 md:text-lg">
            {finalCta.body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={finalCta.primary.href} variant="lime" size="lg">
              {finalCta.primary.label}
            </Button>
            <Button
              href={finalCta.secondary.href}
              variant="secondary"
              size="lg"
              className="border-ground/30 text-ground hover:border-lime hover:bg-transparent hover:text-lime"
            >
              {finalCta.secondary.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
