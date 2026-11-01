"use client";

import type { ReactNode } from "react";
import { instituteMetrics } from "@/lib/content/institute";
import { cn } from "@/lib/utils/cn";

type PanelCopy = {
  eyebrow: string;
  headline: string;
  support: string;
  footnote: string;
};

type AuthShellProps = {
  children: ReactNode;
  title: string;
  detail?: string;
  description?: string;
  tone?: "login" | "register" | "recover";
  variant?: "login" | "register" | "recover";
  className?: string;
};

const PANEL_COPY: Record<"login" | "register" | "recover", PanelCopy> = {
  login: {
    eyebrow: "Learner access",
    headline: "Continue into programmes, enrolments, and progress.",
    support:
      "Sign in with your CAITECH credentials to reach cart, orders, classwork, and your learner dashboard.",
    footnote: "Secure session for enrolled learners and returning applicants.",
  },
  register: {
    eyebrow: "Create account",
    headline: "Start with a learner profile built for technical training.",
    support:
      "Register once, then enrol in programmes, manage orders, and track progress from one account.",
    footnote: "One account covers courses, payments, and institutional access.",
  },
  recover: {
    eyebrow: "Account recovery",
    headline: "Reset access with a secure recovery path.",
    support:
      "Use the verified recovery flow to return to classwork, enrolments, and progress without friction.",
    footnote: "Password reset keeps your learner profile and institutional access intact.",
  },
};

const FEATURED_METRICS = instituteMetrics.slice(0, 3);

function resolveTone(
  tone?: AuthShellProps["tone"],
  variant?: AuthShellProps["variant"],
): "login" | "register" | "recover" {
  return tone ?? variant ?? "login";
}

/**
 * Auth page body only — header/footer come from PublicShell SiteHeader/SiteFooter
 * so login/register match the rest of the site navigation.
 */
export function AuthShell({
  children,
  title,
  detail,
  description,
  tone,
  variant,
  className,
}: AuthShellProps) {
  const panelKey = resolveTone(tone, variant);
  const panel = PANEL_COPY[panelKey];
  const formDetail = detail ?? description;

  return (
    <div className={cn("flex min-h-[calc(100dvh-var(--site-header-height,4.25rem))] flex-col bg-ground text-ink", className)}>
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 lg:grid-cols-12">
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
      </div>
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
        "rounded-[var(--radius-md)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger",
        className,
      )}
    >
      {message}
    </div>
  );
}
