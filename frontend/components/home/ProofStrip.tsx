import { instituteMetrics } from "@/lib/content/institute";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

/**
 * Compact institutional proof — verified live-site metrics only.
 * Swap values for API metrics later without redesigning layout.
 */
export function ProofStrip({ className }: { className?: string }) {
  return (
    <section
      aria-label="Institute at a glance"
      className={cn("border-b border-line bg-surface", className)}
    >
      <Container>
        <ul className="grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
          {instituteMetrics.map((m, i) => (
            <li
              key={m.label}
              className={cn(
                "flex flex-col gap-1.5 px-4 py-7 sm:px-6 md:py-8",
                i % 2 === 1 && "border-l border-line md:border-l-0",
                i > 1 && "border-t border-line md:border-t-0",
              )}
            >
              <span className="font-display text-3xl text-petrol tabular-nums md:text-4xl">
                {m.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                {m.label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
