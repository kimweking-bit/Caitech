"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/navigation/Logo";
import { instituteContact } from "@/lib/content/institute";
import { cn } from "@/lib/utils/cn";

export type AuthShellVariant = "login" | "register" | "forgot" | "reset";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Left-panel editorial tone; defaults to login. */
  variant?: AuthShellVariant;
  className?: string;
};

const PANEL_COPY: Record<
  AuthShellVariant,
  { eyebrow: string; headline: string; support: string }
> = {
  login: {
    eyebrow: "Learner portal",
    headline: "Build the skills behind what comes next.",
    support:
      "Sign in to continue coursework, track progress, and access your CAITECH learning workspace.",
  },
  register: {
    eyebrow: "Join CAITECH",
    headline: "Start your learning journey with purpose.",
    support:
      "Create an account to explore programmes, enrol in courses, and begin building practical technical skill.",
  },
  forgot: {
    eyebrow: "Account recovery",
    headline: "Regain access with a secure reset link.",
    support:
      "We will email instructions to the address on your CAITECH account so you can set a new password.",
  },
  reset: {
    eyebrow: "Account recovery",
    headline: "Choose a new password and return to class.",
    support:
      "Set a strong password to protect your learner profile, enrolments, and course progress.",
  },
};

const DESTINATIONS = [
  { href: "/student", label: "Student workspace", detail: "Courses & progress" },
  {
    href: "/instructor",
    label: "Instructor desk",
    detail: "Teaching tools",
  },
  { href: "/admin", label: "Administration", detail: "Institute ops" },
] as const;

/**
 * Shared editorial auth layout: institutional left panel + form column.
 * Pages keep their own auth handlers; this shell is presentation only.
 */
export function AuthShell({
  title,
  description,
  children,
  variant = "login",
  className,
}: AuthShellProps) {
  const panel = PANEL_COPY[variant];
  const phones = instituteContact.phones.filter(Boolean);
  const primaryPhone = phones[0];
  const secondaryPhone = phones[1];
  const address = instituteContact.addressLines.join(", ");

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col bg-ground text-ink",
        className,
      )}
    >
      {/* Minimal top bar */}
      <header className="shrink-0 border-b border-line bg-ground/95">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo compact />
          <nav
            className="flex items-center gap-1 sm:gap-2"
            aria-label="Auth navigation"
          >
            <Link
              href="/"
              className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Home
            </Link>
            <span className="hidden h-3 w-px bg-line sm:block" aria-hidden />
            <Link
              href="/courses"
              className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Courses
            </Link>
          </nav>
        </div>
      </header>

      {/* Main split */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
        {/* Left — institutional panel (desktop) */}
        <aside className="relative hidden overflow-hidden border-line bg-petrol text-ground lg:flex lg:flex-col lg:border-r">
          <div
            className="pointer-events-none absolute inset-0 text-ground opacity-[0.07]"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-10 left-0 w-px bg-lime/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-ground/10"
            aria-hidden
          />

          <div className="relative flex flex-1 flex-col justify-between gap-10 px-10 py-12 xl:px-12 xl:py-14">
            <div className="max-w-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">
                {panel.eyebrow}
              </p>
              <div className="mt-5 h-px w-10 bg-lime/70" aria-hidden />
              <h1 className="mt-6 font-display text-[1.85rem] leading-[1.15] tracking-tight text-ground xl:text-[2.1rem]">
                {panel.headline}
              </h1>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-ground/75">
                {panel.support}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ground/45">
                Portal destinations
              </p>
              <ul className="mt-4 divide-y divide-ground/10 border-y border-ground/10">
                {DESTINATIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between gap-4 py-3.5 transition-colors hover:bg-ground/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lime"
                    >
                      <span className="text-sm text-ground/90 group-hover:text-lime">
                        {item.label}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ground/40">
                        {item.detail}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-sm font-mono text-[10px] leading-relaxed tracking-wide text-ground/40">
                CAITECH Global Institute · Nairobi · Practical technical
                education
              </p>
            </div>
          </div>
        </aside>

        {/* Right — form column */}
        <section className="relative flex flex-1 flex-col bg-ground">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
            {/* Mobile-only institutional intro */}
            <div className="mb-8 border-b border-line pb-6 lg:hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-petrol/70">
                {panel.eyebrow}
              </p>
              <p className="mt-2 font-display text-xl leading-snug text-petrol">
                {panel.headline}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                Secure access
              </p>
              <h2 className="mt-2 font-display text-[1.65rem] leading-tight tracking-tight text-petrol sm:text-3xl">
                {title}
              </h2>
              {description ? (
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  {description}
                </p>
              ) : null}
              <div className="mt-6 h-px w-full bg-line" aria-hidden />
            </div>

            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>

      {/* Compact institutional footer */}
      <footer className="shrink-0 border-t border-line bg-ground">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:px-8 lg:py-6">
          <div className="min-w-0 max-w-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              CAITECH Global Institute
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              {address}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              {primaryPhone ? (
                <a
                  href={`tel:${primaryPhone.replace(/\s/g, "")}`}
                  className="hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
                >
                  {primaryPhone}
                </a>
              ) : null}
              {secondaryPhone ? (
                <>
                  <span className="text-line" aria-hidden>
                    ·
                  </span>
                  <a
                    href={`tel:${secondaryPhone.replace(/\s/g, "")}`}
                    className="hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
                  >
                    {secondaryPhone}
                  </a>
                </>
              ) : null}
              <span className="text-line" aria-hidden>
                ·
              </span>
              <a
                href={`mailto:${instituteContact.email}`}
                className="hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
              >
                {instituteContact.email}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-end">
            <Link
              href="/privacy"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Compact form section heading for nested auth blocks. */
export function AuthFormTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-1">
      <h3 className="font-display text-xl text-petrol">{title}</h3>
      {description ? (
        <p className="mt-1.5 text-sm text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
