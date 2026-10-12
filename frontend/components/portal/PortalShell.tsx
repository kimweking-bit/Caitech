"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { portalHome, type PortalRole } from "@/lib/portal/roles";
import { cn } from "@/lib/utils/cn";
import type { PortalKind, PortalNavItem, PortalTheme } from "@/components/portal/types";

const THEMES: Record<PortalKind, PortalTheme> = {
  student: {
    kind: "student",
    productLabel: "Learning",
    accentClass: "bg-lime",
    sidebarClass: "bg-ground border-r border-line",
    topBarClass: "border-b border-line bg-surface/90 backdrop-blur-sm",
    navActiveClass: "bg-petrol text-lime",
    navIdleClass: "text-ink-muted hover:bg-surface hover:text-petrol",
    badgeClass: "bg-lime/20 text-petrol",
  },
  instructor: {
    kind: "instructor",
    productLabel: "Teaching",
    accentClass: "bg-petrol",
    sidebarClass: "bg-petrol text-ground border-r border-petrol-deep",
    topBarClass: "border-b border-line bg-ground",
    navActiveClass: "bg-lime text-petrol",
    navIdleClass: "text-ground/70 hover:bg-petrol-deep hover:text-ground",
    badgeClass: "bg-lime text-petrol",
  },
  admin: {
    kind: "admin",
    productLabel: "Operations",
    accentClass: "bg-petrol-deep",
    sidebarClass: "bg-petrol-deep text-ground border-r border-black/20",
    topBarClass: "border-b border-line bg-surface",
    navActiveClass: "bg-surface text-petrol font-medium",
    navIdleClass: "text-ground/65 hover:bg-petrol hover:text-ground",
    badgeClass: "bg-surface text-petrol",
  },
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  kind,
  nav,
  title,
  children,
}: {
  kind: PortalKind;
  nav: PortalNavItem[];
  title?: string;
  children: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const theme = THEMES[kind];
  const home = portalHome(user);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Account";

  const groups = groupNav(nav);

  return (
    <div
      className={cn(
        "min-h-screen text-ink",
        kind === "student" && "bg-ground",
        kind === "instructor" && "bg-ground",
        kind === "admin" && "bg-[#eef1ef]",
      )}
    >
      {/* Top accent rail — different weight per portal */}
      <div
        className={cn(
          "h-1 w-full",
          kind === "student" && "bg-lime",
          kind === "instructor" && "bg-gradient-to-r from-petrol via-petrol to-lime",
          kind === "admin" && "bg-petrol-deep",
        )}
        aria-hidden
      />

      <div className="flex min-h-[calc(100vh-4px)]">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden w-60 shrink-0 flex-col md:flex lg:w-64",
            theme.sidebarClass,
          )}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
            <Link href={home} className="group flex min-w-0 flex-col">
              <span
                className={cn(
                  "font-display text-lg leading-none tracking-tight",
                  kind === "student" ? "text-petrol" : "text-ground",
                )}
              >
                CAITECH
              </span>
              <span
                className={cn(
                  "mt-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                  kind === "student" ? "text-ink-muted" : "text-ground/55",
                )}
              >
                {theme.productLabel}
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
            {groups.map((g) => (
              <div key={g.label || "main"}>
                {g.label ? (
                  <p
                    className={cn(
                      "mb-1.5 px-2 font-mono text-[9px] uppercase tracking-[0.14em]",
                      kind === "student" ? "text-ink-muted" : "text-ground/45",
                    )}
                  >
                    {g.label}
                  </p>
                ) : null}
                <ul className="space-y-0.5">
                  {g.items.map((item) => {
                    const active = isActive(pathname, item.href, item.exact);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-sm px-2.5 py-2 text-sm transition-colors",
                            active ? theme.navActiveClass : theme.navIdleClass,
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div
            className={cn(
              "border-t px-3 py-3",
              kind === "student" ? "border-line" : "border-white/10",
            )}
          >
            <p
              className={cn(
                "truncate text-sm font-medium",
                kind === "student" ? "text-petrol" : "text-ground",
              )}
            >
              {displayName}
            </p>
            <p
              className={cn(
                "truncate font-mono text-[10px]",
                kind === "student" ? "text-ink-muted" : "text-ground/50",
              )}
            >
              {user?.email}
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/"
                className={cn(
                  "text-[11px] underline-offset-2 hover:underline",
                  kind === "student" ? "text-ink-muted" : "text-ground/60",
                )}
              >
                Site
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className={cn(
                  "text-[11px] underline-offset-2 hover:underline",
                  kind === "student" ? "text-ink-muted" : "text-ground/60",
                )}
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 md:px-6",
              theme.topBarClass,
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center border border-line bg-surface px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-petrol md:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Toggle navigation"
              >
                Menu
              </button>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted md:hidden">
                  {theme.productLabel}
                </p>
                {title ? (
                  <h1 className="truncate font-display text-lg text-petrol md:text-xl">
                    {title}
                  </h1>
                ) : (
                  <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted md:block">
                    {kind === "student" && "Your learning workspace"}
                    {kind === "instructor" && "Teaching workspace"}
                    {kind === "admin" && "Institutional control center"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "hidden font-mono text-[10px] uppercase tracking-[0.12em] sm:inline-block",
                  "border border-line px-2 py-1",
                  theme.badgeClass,
                )}
              >
                {(kind as PortalRole).toUpperCase()}
              </span>
              <Link
                href={
                  kind === "student"
                    ? "/student/profile"
                    : kind === "instructor"
                      ? "/instructor/profile"
                      : "/admin"
                }
                className="hidden text-sm text-petrol underline-offset-4 hover:underline sm:inline"
              >
                {displayName}
              </Link>
            </div>
          </header>

          {/* Mobile drawer */}
          {open ? (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-petrol/40"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              />
              <div
                className={cn(
                  "absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col shadow-lg",
                  theme.sidebarClass,
                )}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span
                    className={cn(
                      "font-display text-lg",
                      kind === "student" ? "text-petrol" : "text-ground",
                    )}
                  >
                    CAITECH · {theme.productLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.12em]",
                      kind === "student" ? "text-petrol" : "text-ground",
                    )}
                  >
                    Close
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 py-3">
                  {nav.map((item) => {
                    const active = isActive(pathname, item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "mb-0.5 block rounded-sm px-2.5 py-2.5 text-sm",
                          active ? theme.navActiveClass : theme.navIdleClass,
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-white/10 p-3">
                  <button
                    type="button"
                    onClick={() => logout()}
                    className={cn(
                      "text-sm underline-offset-2 hover:underline",
                      kind === "student" ? "text-petrol" : "text-ground",
                    )}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <main
            className={cn(
              "flex-1",
              kind === "student" && "px-4 py-6 md:px-8 md:py-8",
              kind === "instructor" && "px-4 py-5 md:px-6 md:py-6",
              kind === "admin" && "px-3 py-4 md:px-5 md:py-5",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function groupNav(nav: PortalNavItem[]) {
  const map = new Map<string, PortalNavItem[]>();
  for (const item of nav) {
    const key = item.group || "";
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}
