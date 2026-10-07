import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "petrol" | "lime" | "outline";

const toneClass: Record<Tone, string> = {
  neutral: "bg-ground text-ink-muted border-line",
  petrol: "bg-petrol/10 text-petrol border-petrol/15",
  lime: "bg-lime text-lime-ink border-lime font-semibold",
  outline: "bg-transparent text-ink-muted border-line",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5",
        "font-mono text-[11px] uppercase tracking-[0.08em]",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
