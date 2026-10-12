"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const PORTAL_PREFIXES = ["/student", "/instructor", "/admin"];
const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function isBareRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)))
    return true;
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Public marketing chrome. Portals and auth compositions own their own shell.
 */
export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isBareRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
