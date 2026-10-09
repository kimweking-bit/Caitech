import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "border-line bg-ground text-ink-muted",
  success: "border-line bg-lime/30 text-petrol",
  warning: "border-line bg-surface text-petrol",
  danger: "border-line bg-ground text-danger",
  info: "border-line bg-petrol/5 text-petrol",
} as const;

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
