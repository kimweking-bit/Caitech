import { aiPath } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function AiPathTeaser() {
  return (
    <Section eyebrow={aiPath.eyebrow} title={aiPath.title} tone="surface">
      <div className="grid gap-8 border border-line bg-ground p-6 md:grid-cols-12 md:p-10">
        <div className="md:col-span-7">
          <p className="text-base leading-relaxed text-ink-muted md:text-lg">
            {aiPath.body}
          </p>
          <div className="mt-8">
            <Button href={aiPath.ctaHref} variant="primary" size="lg">
              {aiPath.ctaLabel}
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-line pt-6 md:col-span-4 md:col-start-9 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Not a chatbot
          </p>
          <p className="font-display text-2xl leading-snug text-petrol">
            Structured questions. Concrete course sequence. Your goals first.
          </p>
          <div className="hairline-lime" aria-hidden />
        </div>
      </div>
    </Section>
  );
}
