import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function MetricGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-petrol">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
