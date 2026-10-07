import { schools } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export function SchoolsGrid() {
  return (
    <Section
      eyebrow={schools.eyebrow}
      title={schools.title}
      lede={schools.lede}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {schools.items.map((item, index) => (
          <Card as="li" key={item.name} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
            <h3 className="font-display text-xl text-petrol leading-snug">
              {item.name}
            </h3>
            <p className="text-sm leading-relaxed text-ink-muted">
              {item.summary}
            </p>
          </Card>
        ))}
      </ul>
    </Section>
  );
}
