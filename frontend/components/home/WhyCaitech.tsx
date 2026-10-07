import { why } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";

export function WhyCaitech() {
  return (
    <Section eyebrow={why.eyebrow} title={why.title}>
      <ol className="grid gap-0 border border-line bg-surface md:grid-cols-3">
        {why.items.map((item, i) => (
          <li
            key={item.title}
            className="flex flex-col gap-3 border-line p-6 md:border-r md:p-8 md:last:border-r-0 border-b md:border-b-0 last:border-b-0"
          >
            <span className="font-mono text-[11px] text-ink-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl text-petrol">{item.title}</h3>
            <p className="text-sm leading-relaxed text-ink-muted md:text-[0.95rem]">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
