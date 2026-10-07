import { toolsBehindWork } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";

export function ToolsStrip() {
  return (
    <Section
      eyebrow="Stack"
      title="The tools behind the work"
      lede="Learn the software, systems and technical methods used to turn ideas into working projects."
      id="tools"
    >
      <ol className="grid grid-cols-2 border border-line bg-surface sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {toolsBehindWork.map((tool, i) => (
          <li
            key={tool}
            className="flex flex-col justify-between gap-6 border-line px-4 py-5 sm:px-5 border-r border-b [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 md:[&:nth-child(3n)]:border-r md:[&:nth-child(4n)]:border-r-0 lg:[&:nth-child(4n)]:border-r lg:[&:nth-child(5n)]:border-r-0"
          >
            <span className="font-mono text-[10px] tabular-nums tracking-[0.08em] text-ink-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-lg leading-snug text-petrol md:text-xl">
              {tool}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
