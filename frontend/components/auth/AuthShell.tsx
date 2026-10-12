"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Logo } from "@/components/navigation/Logo";
import { instituteMetrics } from "@/lib/content/institute";
import { cn } from "@/lib/utils/cn";

export type AuthShellTone = "login" | "register" | "recover" | "forgot" | "reset";
export type AuthShellVariant = AuthShellTone;

type AuthShellProps = {
  title: string;
  detail?: string;
  description?: string;
  children: ReactNode;
  tone?: AuthShellTone;
  variant?: AuthShellVariant;
  className?: string;
};

type PanelCopy = {
  eyebrow: string;
  headline: string;
  support: string;
  footnote: string;
};

const PANEL_COPY: Record<"login" | "register" | "recover", PanelCopy> = {
  login: {
    eyebrow: "Learner portal",
    headline: "Build the skills behind what comes next.",
    support:
      "Sign in to continue coursework, track progress, and access your CAITECH learning workspace.",
    footnote:
      "Student, instructor, and administration workspaces use one secure CAITECH account.",
  },
  register: {
    eyebrow: "Join CAITECH",
    headline: "Start where practical skill meets real opportunity.",
    support:
      "Create an account to explore programmes, enrol in courses, and begin building technical capability with purpose.",
    footnote:
      "Your account becomes the starting point for enrolments, orders, and learning progress.",
  },
  recover: {
    eyebrow: "Account recovery",
    headline: "Regain access with a secure reset path.",
    support:
      "Use the verified recovery flow to return to classwork, enrolments, and progress without friction.",
    footnote: "Password reset keeps your learner profile and institutional access protected.",
  },
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/contact", label: "Contact" },
] as const;

const FEATURED_METRICS = instituteMetrics.slice(0, 3);

function resolveTone(tone?: AuthShellTone, variant?: AuthShellVariant): keyof typeof PANEL_COPY {
  const raw = tone ?? variant ?? "login";
  if (raw === "forgot" || raw === "reset" || raw === "recover") return "recover";
  if (raw === "register") return "register";
  return "login";
}

export function AuthShell({
  title,
  detail,
  description,
  children,
  tone,
  variant = "login",
  className,
}: AuthShellProps) {
  const panelKey = resolveTone(tone, variant);
  const panel = PANEL_COPY[panelKey];
  const formDetail = detail ?? description;

  return (
    <div className={cn("flex min-h-dvh flex-col bg-ground text-ink", className)}>
      <header className="shrink-0 border-b border-line bg-ground/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo compact />
          <nav
            className="flex min-w-0 items-center gap-0.5 sm:gap-1"
            aria-label="Auth navigation"
          >
            {NAV_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center gap-0.5 sm:gap-1">
                {index > 0 ? (
                  <span className="hidden h-3 w-px bg-line sm:block" aria-hidden />
                ) : null}
                <Link
                  href={link.href}
                  className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol sm:px-2.5"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-3.5rem)] w-full max-w-7xl shrink-0 grid-cols-1 lg:grid-cols-12">
        <aside className="relative hidden overflow-hidden bg-petrol text-ground lg:col-span-5 lg:flex lg:flex-col xl:col-span-5">
          <div
            className="pointer-events-none absolute inset-0 text-ground opacity-[0.055]"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
          <div
            className="pointer-events-none absolute left-7 top-7 h-5 w-5 border-l border-t border-lime/60"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-7 top-7 h-5 w-5 border-r border-t border-ground/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-7 left-7 h-5 w-5 border-b border-l border-ground/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-7 right-7 h-5 w-5 border-b border-r border-lime/45"
            aria-hidden
          />

          <div className="relative flex flex-1 flex-col justify-between gap-6 px-10 py-8 xl:px-12">
            <div className="max-w-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">
                {panel.eyebrow}
              </p>
              <div className="mt-4 h-px w-12 bg-lime/85" aria-hidden />
              <h1 className="mt-5 font-display text-[1.85rem] leading-[1.1] tracking-tight text-ground xl:text-[2.15rem]">
                {panel.headline}
              </h1>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ground/76">
                {panel.support}
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-3 border-y border-ground/12">
                {FEATURED_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="border-r border-ground/12 py-2.5 pr-3 last:border-r-0 last:pr-0"
                  >
                    <p className="font-display text-lg leading-none text-ground">
                      {metric.value}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ground/45">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="max-w-sm border-l border-lime/60 pl-4 text-xs leading-relaxed text-ground/55">
                {panel.footnote}
              </p>
            </div>
          </div>
        </aside>

        <section className="relative flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:col-span-7 lg:px-12 lg:py-8 xl:px-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent lg:hidden"
            aria-hidden
          />

          <div className="mx-auto w-full max-w-md">
            <div className="mb-5 border-b border-line pb-4 lg:hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-petrol">
                {panel.eyebrow}
              </p>
              <p className="mt-2 font-display text-xl leading-snug tracking-tight text-ink">
                {panel.headline}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {panel.support}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                CAITECH secure access
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight tracking-tight text-petrol sm:text-[1.8rem]">
                {title}
              </h2>
              {formDetail ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {formDetail}
                </p>
              ) : null}
              <div className="mt-4 h-px w-full bg-line" aria-hidden />
            </div>

            <div className="mt-5">{children}</div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export function AuthError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "border border-danger/25 border-l-[3px] border-l-lime bg-danger/5 px-3.5 py-3 text-sm leading-snug text-danger",
        className,
      )}
    >
      {message}
    </div>
  );
}
