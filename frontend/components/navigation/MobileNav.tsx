"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { primaryNav, utilityNav } from "@/lib/content/nav";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

/**
 * Mobile navigation contract (Phase 1):
 * - Toggle button aria-expanded + aria-controls
 * - Panel role="dialog" aria-modal when open
 * - Escape closes; restores focus to toggle
 * - Body scroll lock while open
 * - Focus moves into panel on open
 * - Route change closes panel
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape + body scroll lock + initial focus
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // Focus first focusable in panel
    const t = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  // Restore focus to toggle when closing via state
  useEffect(() => {
    if (!open) return;
    return () => {
      // runs on cleanup when open flips false or unmount
      queueMicrotask(() => toggleRef.current?.focus());
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]",
          "border border-line bg-surface text-petrol",
          "hover:border-petrol/40",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => (open ? close() : openPanel())}
      >
        <span className="sr-only">{open ? "Close" : "Menu"}</span>
        <MenuIcon open={open} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-petrol/40 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className={cn(
              "fixed inset-x-0 top-16 z-50 border-b border-line bg-surface",
              "max-h-[calc(100dvh-4rem)] overflow-y-auto shadow-[var(--shadow-md)]",
            )}
          >
            <nav className="flex flex-col px-5 py-4" aria-label="Mobile primary">
              <ul className="flex flex-col gap-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-11 items-center border-b border-line/70 px-1 text-base text-petrol",
                        "hover:text-petrol-deep",
                        pathname === item.href && "font-semibold",
                      )}
                      onClick={close}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 pb-4">
                {utilityNav.map((item) =>
                  item.emphasis === "primary" ? (
                    <Button
                      key={item.href}
                      href={item.href}
                      variant="lime"
                      size="lg"
                      className="w-full"
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      key={item.href}
                      href={item.href}
                      variant="secondary"
                      size="lg"
                      className="w-full"
                    >
                      {item.label}
                    </Button>
                  ),
                )}
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden
      className="text-current"
    >
      {open ? (
        <path
          d="M4 4 L16 16 M16 4 L4 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      ) : (
        <>
          <path d="M3 5h14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 15h14" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}
