import Image from "next/image";
import { homeImages, outcomes } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";

export function Outcomes() {
  return (
    <Section
      eyebrow="Capability"
      title="What you leave able to do"
      lede="You don’t just sit through lessons. You leave able to do the work."
      tone="surface"
      id="outcomes"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden border border-line bg-petrol/5 sm:aspect-[5/4] lg:col-span-5 lg:aspect-auto lg:min-h-[28rem]">
          <Image
            src={homeImages.outcomes.src}
            alt={homeImages.outcomes.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-petrol/40 to-transparent"
          />
        </div>

        <ul className="grid gap-0 border border-line bg-ground sm:grid-cols-2 lg:col-span-7">
          {outcomes.map((item) => (
            <li
              key={item.verb}
              className="border-b border-line p-5 last:border-b-0 sm:border-r sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 md:p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                Outcome
              </p>
              <h3 className="mt-2 font-display text-2xl uppercase tracking-wide text-petrol md:text-3xl">
                {item.verb}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
