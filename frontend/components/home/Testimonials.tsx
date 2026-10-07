import { testimonials } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <Section
      eyebrow="Students"
      title="What the experience changed"
      lede="Exact words from CAITECH graduates and learners — unedited."
      id="testimonials"
    >
      <ul className="grid gap-4 md:grid-cols-3 md:gap-0 md:border md:border-line">
        {testimonials.map((t, i) => (
          <li
            key={t.name}
            className="flex flex-col border border-line bg-surface p-6 md:border-0 md:border-r md:last:border-r-0 md:p-8"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <blockquote className="mt-5 flex flex-1 flex-col">
              <p className="font-display text-xl leading-snug text-petrol text-balance md:text-[1.35rem]">
                “{t.quote}”
              </p>
              <footer className="mt-8 flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-10 w-10 place-items-center border border-line bg-ground font-mono text-xs text-petrol"
                >
                  {initials(t.name)}
                </span>
                <cite className="not-italic">
                  <span className="block text-sm font-medium text-ink">
                    {t.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                    CAITECH learner
                  </span>
                </cite>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </Section>
  );
}
