"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils/cn";
import type { PortalKind, PortalNavItem } from "./types";

const brand: Record<
  PortalKind,
  { title: string; subtitle: string; home: string }
> = {
  student: {
    title: "Student",
    subtitle: "Learning portal",
    home: "/student",
  },
  instructor: {
    title: "Instructor",
    subtitle: "Teaching workspace",
    home: "/instructor",
  },
  admin: {
    title: "Admin",
    subtitle: "Operations console",
    home: "/admin",
  },
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  kind,
  nav,
  children,
}: {
  kind: PortalKind;
  nav: PortalNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const meta = brand[kind];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-ground text-ink">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-petrol text-ground md:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href={meta.home} className="block">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">
                CAITECH
              </p>
              <p className="mt-1 font-display text-xl leading-none text-ground">
                {meta.title}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ground/60">
                {meta.subtitle}
              </p>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="list-none space-y-0.5 p-0">
              {nav.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                        active
                          ? "bg-lime text-petrol"
                          : "text-ground/80 hover:bg-white/5 hover:text-ground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-white/10 px-5 py-4">
            <p className="truncate font-mono text-[11px] text-ground/70">
              {user?.username}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ground/60 hover:text-lime"
              >
                Site
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ground/60 hover:text-lime"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-ground/95 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="border border-line px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-petrol md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                Menu
              </button>
              <div className="min-w-0 md:hidden">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  CAITECH · {meta.title}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              <span className="font-mono text-[11px] text-ink-muted">
                {user?.email || user?.username}
              </span>
              <Link
                href="/"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-petrol hover:text-lime-ink"
              >
                Public site
              </Link>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-petrol/50"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-petrol text-ground shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">
                  CAITECH
                </p>
                <p className="font-display text-lg text-ground">{meta.title}</p>
              </div>
              <button
                type="button"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ground/70"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="list-none space-y-0.5 p-0">
                {nav.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em]",
                          active
                            ? "bg-lime text-petrol"
                            : "text-ground/85 hover:bg-white/5",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t border-white/10 px-4 py-4">
              <button
                type="button"
                onClick={() => void logout()}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ground/70"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
