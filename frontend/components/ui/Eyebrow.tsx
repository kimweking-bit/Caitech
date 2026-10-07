import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
