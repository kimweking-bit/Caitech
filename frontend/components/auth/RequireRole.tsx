"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { portalHome } from "@/lib/portal/roles";
import { Button } from "@/components/ui/Button";

type Role = "student" | "instructor" | "admin" | "staff";

function hasRole(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
  role: Role,
): boolean {
  if (role === "staff" || role === "admin") return Boolean(user.is_staff);
  if (role === "instructor")
    return Boolean(
      user.is_instructor || user.is_verified_instructor || user.is_staff,
    );
  // student portal: learners and staff (support/demo)
  return Boolean(user.is_student || user.is_staff);
}

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

  if (!hasRole(user, role)) {
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
          This area requires {role === "admin" ? "admin" : role} permissions.
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
