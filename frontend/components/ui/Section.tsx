import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Tone = "ground" | "surface" | "petrol";

const toneClass: Record<Tone, string> = {
  ground: "bg-ground text-ink",
  surface: "bg-surface text-ink border-y border-line",
  petrol: "bg-petrol text-ground",
};

export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  tone = "ground",
  className,
  containerWidth = "xl",
  headerClassName,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  children?: ReactNode;
  tone?: Tone;
  className?: string;
  containerWidth?: "sm" | "md" | "lg" | "xl" | "full";
  headerClassName?: string;
}) {
  const titleColor =
    tone === "petrol" ? "text-ground" : "text-petrol";
  const ledeColor =
    tone === "petrol" ? "text-ground/80" : "text-ink-muted";
  const eyebrowColor =
    tone === "petrol" ? "text-lime" : undefined;

  return (
    <section
      id={id}
      className={cn(
        "py-14 md:py-20 lg:py-24",
        toneClass[tone],
        className,
      )}
    >
      <Container width={containerWidth}>
        {(eyebrow || title || lede) && (
          <header className={cn("mb-10 md:mb-12 max-w-3xl", headerClassName)}>
            {eyebrow ? (
              <Eyebrow className={cn("mb-3", eyebrowColor)}>{eyebrow}</Eyebrow>
            ) : null}
            {title ? (
              <h2
                className={cn(
                  "font-display text-3xl md:text-4xl text-balance",
                  titleColor,
                )}
              >
                {title}
              </h2>
            ) : null}
            {lede ? (
              <p className={cn("mt-4 text-base md:text-lg leading-relaxed", ledeColor)}>
                {lede}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
