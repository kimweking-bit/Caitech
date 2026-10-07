import { practical } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";

export function PracticalLearning() {
  return (
    <Section tone="petrol" className="!py-16 md:!py-20">
      <div className="grid items-end gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
            {practical.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl text-ground md:text-4xl text-balance">
            {practical.title}
          </h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <p className="text-base leading-relaxed text-ground/85 md:text-lg">
            {practical.body}
          </p>
        </div>
      </div>
    </Section>
  );
}
