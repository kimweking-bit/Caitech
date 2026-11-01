import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Width = "sm" | "md" | "lg" | "xl" | "full";

const widthClass: Record<Width, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[70rem]",
  full: "max-w-none",
};

export function Container({
  children,
  width = "xl",
  className,
  id,
  as: Tag = "div",
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
  /** Anchor target for in-page links (e.g. #catalogue, #journal). */
  id?: string;
  as?: ElementType;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        widthClass[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
