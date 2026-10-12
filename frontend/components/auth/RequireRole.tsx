"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  canAccessPortal,
  portalHome,
  type PortalRole,
} from "@/lib/portal/roles";
import { Button } from "@/components/ui/Button";

type Role = PortalRole | "staff";

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const required: PortalRole = role === "staff" ? "admin" : role;

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return (
      <div className="px-4 py-16 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Checking access…
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (!canAccessPortal(user, required)) {
    const home = portalHome(user);
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Restricted
        </p>
        <h1 className="mt-3 font-display text-3xl text-petrol">
          You do not have access
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          This area is the {required} portal. Your account is routed to a
          different workspace.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href={home} variant="lime">
            Open my portal
          </Button>
          <Button href="/courses" variant="secondary">
            Courses
          </Button>
        </div>
        <p className="mt-6 text-xs text-ink-muted">
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
