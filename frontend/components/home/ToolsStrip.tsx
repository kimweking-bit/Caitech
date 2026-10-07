import { toolsBehindWork } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";

/**
 * Tools grid — CSS-only micro-interactions (hover / focus-within).
 * No client JS; reduced-motion respected via globals.
 */
export function ToolsStrip() {
  return (
    <Section
      eyebrow="Stack"
      title="The tools behind the work"
      lede="Learn the software, systems and technical methods used to turn ideas into working projects."
      id="tools"
    >
      <ol className="tools-grid grid grid-cols-2 border border-line bg-surface sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {toolsBehindWork.map((tool, i) => (
          <li
            key={tool.name}
            tabIndex={0}
            className="tool-cell group relative flex flex-col justify-between gap-5 overflow-hidden border-line px-4 py-5 outline-none sm:px-5 border-r border-b [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 md:[&:nth-child(3n)]:border-r md:[&:nth-child(4n)]:border-r-0 lg:[&:nth-child(4n)]:border-r lg:[&:nth-child(5n)]:border-r-0"
          >
            <span className="tool-cell__index font-mono text-[10px] tabular-nums tracking-[0.08em]">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="tool-cell__body min-w-0">
              <span className="tool-cell__name block font-display text-lg leading-snug md:text-xl">
                {tool.name}
              </span>
              <span className="tool-cell__label font-mono text-[10px] uppercase tracking-[0.12em]">
                {tool.label}
              </span>
            </div>

            {/* Lime accent line — scales from left on active */}
            <span className="tool-cell__rule" aria-hidden />
          </li>
        ))}
      </ol>
    </Section>
  );
}
