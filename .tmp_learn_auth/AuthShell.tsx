"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/navigation/Logo";
import { instituteContact } from "@/lib/content/institute";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Mono eyebrow above the panel headline */
  eyebrow: string;
  /** Left-panel statement */
  headline: string;
  /** Supporting line under headline */
  lead: string;
  /** Optional technical micro-label */
  detail?: string;
  children: ReactNode;
  /** Slightly different panel accent for register vs login */
  variant?: "login" | "register" | "reset";
};

/**
 * Premium auth composition for CAITECH.
 * Replaces the generic centered-card-on-blank-page pattern.
 */
export function AuthShell({
  eyebrow,
  headline,
  lead,
  detail = "Technical education · Nairobi",
  children,
  variant = "login",
}: Props) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-ground">
      {/* Slim brand bar */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            <Link
              href="/courses"
              className="hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Programmes
            </Link>
            <Link
              href="/"
              className="hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Accent rail */}
      <div
        className={cn(
          "h-1 w-full",
          variant === "register" ? "bg-petrol" : "bg-lime",
        )}
        aria-hidden
      />

      <main className="relative flex flex-1 flex-col">
        {/* Technical grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(18,52,59,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,52,59,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-12 lg:items-stretch">
          {/* Editorial panel */}
          <aside className="relative flex flex-col justify-between border-b border-line bg-petrol px-6 py-10 text-ground sm:px-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:border-line lg:py-14">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-md font-display text-3xl leading-tight tracking-tight text-ground sm:text-4xl lg:text-[2.5rem]">
                {headline}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ground/75 sm:text-base">
                {lead}
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-lime" aria-hidden />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ground/55">
                  {detail}
                </p>
              </div>
              <ul className="space-y-1.5 font-mono text-[11px] text-ground/50">
                <li>Student · learning workspace</li>
                <li>Instructor · teaching workspace</li>
                <li>Admin · institutional operations</li>
              </ul>
            </div>

            {/* Geometric corner mark */}
            <div
              className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 border-l border-t border-lime/30"
              aria-hidden
            />
          </aside>

          {/* Form panel */}
          <section className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10 lg:col-span-7 lg:px-14 lg:py-14">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </section>
        </div>
      </main>

      {/* Compact institutional footer */}
      <footer className="border-t border-line bg-petrol-deep text-ground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-base tracking-tight">
              CAITECH Global Institute
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ground/60">
              {instituteContact.addressLines.join(", ")}
            </p>
          </div>
          <div className="flex flex-col gap-1 font-mono text-[11px] text-ground/65 sm:items-end">
            {instituteContact.phones.map((p) => (
              <a
                key={p}
                href={`tel:${p.replace(/\s/g, "")}`}
                className="hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                {p}
              </a>
            ))}
            <a
              href={`mailto:${instituteContact.email}`}
              className="hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              {instituteContact.email}
            </a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ground/40">
              © {new Date().getFullYear()} CAITECH Global Institute
            </p>
            <div className="flex gap-4 font-mono text-[9px] uppercase tracking-[0.12em] text-ground/45">
              <Link href="/about" className="hover:text-ground">
                About
              </Link>
              <Link href="/contact" className="hover:text-ground">
                Contact
              </Link>
              <Link href="/faq" className="hover:text-ground">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AuthFormTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl tracking-tight text-petrol sm:text-[1.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
