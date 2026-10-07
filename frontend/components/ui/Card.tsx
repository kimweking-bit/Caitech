import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  children,
  className,
  as: Tag = "div",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  padded?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "bg-surface border border-line rounded-[var(--radius-md)]",
        padded && "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
