"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname } from "next/navigation";
import { primaryNav, coursesCategoryHref } from "@/lib/content/nav";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { Logo } from "@/components/navigation/Logo";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";
import type { NavCategory } from "@/types/nav";

function isCoursesPath(pathname: string): boolean {
  return pathname === "/courses" || pathname.startsWith("/courses/");
}

type Props = {
  categories?: readonly NavCategory[];
};

/**
 * Desktop Courses pattern:
 * - "Courses" is a real link → /courses
 * - Adjacent chevron button toggles the mega-menu
 * Hover on the item group still opens the menu for discoverability,
 * but activating the text always navigates.
 */
export function SiteHeader({ categories = [] }: Props) {
  const pathname = usePathname() || "/";
  const [coursesOpen, setCoursesOpen] = useState(false);
  const wrapRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const triggerId = useId();

  const validCategories = categories.filter((c) => c.slug && c.name);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setCoursesOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setCoursesOpen(false), 140);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setCoursesOpen(false);
  }, [clearCloseTimer]);

  const toggleMenu = useCallback(() => {
    clearCloseTimer();
    setCoursesOpen((v) => !v);
  }, [clearCloseTimer]);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!coursesOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [coursesOpen, closeMenu]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  };

  return (
    <header className="site-header sticky top-0 z-40">
      <Container className="site-header__inner flex items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              if (item.coursesMenu) {
                const active = isCoursesPath(pathname);
                return (
                  <li
                    key={item.href}
                    ref={wrapRef}
                    className="nav-item--courses"
                    onMouseEnter={openMenu}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="nav-courses-pair">
                      <Link
                        href={item.href}
                        className={cn(
                          "nav-link nav-link--courses-text px-3 py-2 text-sm font-medium",
                          active && "nav-link--active",
                        )}
                      >
                        {item.label}
                      </Link>
                      <button
                        id={triggerId}
                        type="button"
                        className={cn(
                          "nav-link nav-link--trigger nav-link--courses-chevron",
                          coursesOpen && "nav-link--active",
                        )}
                        aria-expanded={coursesOpen}
                        aria-controls={menuId}
                        aria-haspopup="true"
                        aria-label="Open courses programme menu"
                        onClick={toggleMenu}
                        onKeyDown={onTriggerKeyDown}
                        onFocus={openMenu}
                      >
                        <Chevron open={coursesOpen} />
                      </button>
                    </div>

                    {coursesOpen ? (
                      <div
                        id={menuId}
                        role="menu"
                        aria-labelledby={triggerId}
                        className="courses-mega"
                        onMouseEnter={openMenu}
                        onMouseLeave={scheduleClose}
                      >
                        <p className="courses-mega__title">Programmes</p>
                        <ul className="courses-mega__list">
                          <li>
                            <Link
                              href="/courses"
                              role="menuitem"
                              className="courses-mega__link courses-mega__link--all"
                              onClick={closeMenu}
                            >
                              All courses
                            </Link>
                          </li>
                          {validCategories.map((c) => (
                            <li key={c.slug}>
                              <Link
                                href={coursesCategoryHref(c.slug)}
                                role="menuitem"
                                className="courses-mega__link"
                                onClick={closeMenu}
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))}
                          {validCategories.length === 0 ? (
                            <li>
                              <p className="courses-mega__empty">
                                Browse the full catalogue for every programme area.
                              </p>
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              }

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-link px-3 py-2 text-sm font-medium",
                      active && "nav-link--active",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <AuthHeaderActions />
          <MobileNav categories={validCategories} />
        </div>
      </Container>
    </header>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("nav-chevron", open && "rotate-180")}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
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
