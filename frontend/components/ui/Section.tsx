import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Tone = "ground" | "white" | "navy" | "slate" | "transparent";

const toneClass: Record<Tone, string> = {
  ground: "bg-ground text-navy",
  white: "bg-white text-navy",
  navy: "bg-navy text-ground",
  slate: "bg-slate text-ground",
  transparent: "bg-transparent text-navy",
};

type SectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  tone?: Tone;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

export function Section({
  children,
  className,
  containerClassName,
  tone = "ground",
  eyebrow,
  title,
  description,
  id,
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={cn(
        /* Prefer theme spacing token; fallback keeps sections from collapsing */
        "py-[var(--spacing-section-y,4.5rem)] md:py-[var(--spacing-section-y-lg,6.5rem)]",
        toneClass[tone],
        className,
      )}
    >
      <Container className={containerClassName}>
        {(eyebrow || title || description) && (
          <header className="mb-8 max-w-3xl md:mb-10">
            {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
            {title ? (
              <h2 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-3 text-base leading-relaxed text-slate/85 md:text-lg">
                {description}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
