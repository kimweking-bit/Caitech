"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import type { NavCategory } from "@/lib/content/nav";

/**
 * Portal / app routes keep their own chrome (no public header/footer).
 * Auth pages (login, register, password) use the same public SiteHeader
 * as the rest of the marketing site for consistent navigation.
 */
const CHROMELESS_PREFIXES = [
  "/student",
  "/instructor",
  "/admin",
  "/learn",
  "/account",
];

function isChromeless(pathname: string): boolean {
  if (!pathname) return false;
  return CHROMELESS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

type Props = {
  children: ReactNode;
  categories?: readonly NavCategory[];
};

/**
 * Public chrome shell — sticky header outside page content.
 * Header height is accounted for by hero via --site-header-height.
 */
export function PublicShell({ children, categories = [] }: Props) {
  const pathname = usePathname() || "/";
  const bare = isChromeless(pathname);

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader categories={categories} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
