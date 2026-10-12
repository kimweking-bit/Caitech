import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "border-line bg-ground text-ink-muted",
  success: "border-line bg-lime/30 text-petrol",
  warning: "border-line bg-amber-100 text-petrol",
  danger: "border-line bg-red-50 text-red-800",
  info: "border-line bg-petrol/10 text-petrol",
} as const;

type Tone = keyof typeof tones;

function toneFor(status: string): Tone {
  const s = status.toLowerCase();
  if (
    ["paid", "confirmed", "completed", "approved", "published", "success", "graded", "active"].some(
      (k) => s.includes(k),
    )
  )
    return "success";
  if (["pending", "draft", "in_progress", "submitted", "late", "initiated"].some((k) => s.includes(k)))
    return "warning";
  if (["failed", "rejected", "cancelled", "error", "expired"].some((k) => s.includes(k)))
    return "danger";
  if (["new", "info", "enrollment", "system"].some((k) => s.includes(k))) return "info";
  return "neutral";
}

export function StatusBadge({
  status,
  tone,
  children,
  className,
}: {
  status?: string;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  const label = children ?? status ?? "—";
  const resolved = tone || (status ? toneFor(String(status)) : "neutral");
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        tones[resolved],
        className,
      )}
    >
      {label}
    </span>
  );
}
