import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-ground py-12 md:py-16">
      <Container>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <div className="hairline-lime mb-5" aria-hidden />
        <h1 className="font-display text-4xl text-petrol text-balance md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            {description}
          </p>
        ) : null}
        {children}
      </Container>
    </header>
  );
}
