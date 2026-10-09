"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";

const PORTAL_PREFIXES = ["/student", "/instructor", "/admin"];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const isPortal = PORTAL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
