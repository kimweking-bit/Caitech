"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthMobileLinks } from "@/components/auth/AuthHeaderActions";
import { primaryNav, coursesCategoryHref } from "@/lib/content/nav";
import { Logo } from "@/components/navigation/Logo";
import { cn } from "@/lib/utils/cn";
import type { NavCategory } from "@/types/nav";

type Props = {
  categories?: readonly NavCategory[];
};

/**
 * Mobile drawer.
 * Courses: primary row is a Link to /courses; separate chevron toggles submenu.
 */
export function MobileNav({ categories = [] }: Props) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const panelId = useId();
  const coursesPanelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const validCategories = categories.filter((c) => c.slug && c.name);

  const close = useCallback(() => {
    setOpen(false);
    setCoursesOpen(false);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]",
          "border border-line bg-surface text-petrol",
          "hover:border-petrol/40",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)]",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuIcon open={open} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-petrol/40"
            aria-label="Close menu overlay"
            onClick={close}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100vw)] flex-col border-l border-line bg-ground shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <Logo compact />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-line text-petrol"
                aria-label="Close menu"
                onClick={close}
              >
                <MenuIcon open />
              </button>
            </div>

            <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {primaryNav.map((item) => {
                  if (item.coursesMenu) {
                    const active =
                      pathname === "/courses" || pathname.startsWith("/courses/");
                    return (
                      <li key={item.href} className="mobile-courses">
                        <div className="mobile-courses__row">
                          <Link
                            href={item.href}
                            className={cn(
                              "mobile-courses__link",
                              active && "text-brand-blue font-semibold",
                            )}
                            onClick={close}
                          >
                            {item.label}
                          </Link>
                          <button
                            type="button"
                            className="mobile-courses__chevron-btn"
                            aria-expanded={coursesOpen}
                            aria-controls={coursesPanelId}
                            aria-label={
                              coursesOpen
                                ? "Collapse programme areas"
                                : "Expand programme areas"
                            }
                            onClick={() => setCoursesOpen((v) => !v)}
                          >
                            <Chevron open={coursesOpen} />
                          </button>
                        </div>

                        {coursesOpen ? (
                          <div id={coursesPanelId} className="mobile-courses__panel">
                            <Link
                              href="/courses"
                              className="font-semibold text-brand-blue"
                              onClick={close}
                            >
                              All courses
                            </Link>
                            {validCategories.map((c) => (
                              <Link
                                key={c.slug}
                                href={coursesCategoryHref(c.slug)}
                                onClick={close}
                              >
                                {c.name}
                              </Link>
                            ))}
                            {validCategories.length === 0 ? (
                              <p className="px-2 py-1 text-sm text-ink-muted">
                                Open the catalogue to browse every programme.
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  }

                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-[var(--radius-md)] px-3 py-2.5 text-base text-petrol",
                          "hover:bg-surface",
                          active && "bg-surface font-semibold text-brand-blue",
                        )}
                        onClick={close}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <AuthMobileLinks onNavigate={close} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={cn("transition-transform", open && "rotate-180")}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
