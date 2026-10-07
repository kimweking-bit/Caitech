import { positioning } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";

export function Positioning() {
  return (
    <Section
      eyebrow={positioning.eyebrow}
      title={positioning.title}
      tone="surface"
    >
      <div className="grid gap-8 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <div className="hairline-lime mb-4" aria-hidden />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Institute positioning
          </p>
        </div>
        <div className="space-y-5 md:col-span-7">
          {positioning.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-base leading-relaxed text-ink md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}
