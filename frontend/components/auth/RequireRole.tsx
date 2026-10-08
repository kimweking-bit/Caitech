"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Role = "student" | "instructor" | "staff";

function hasRole(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
  role: Role,
): boolean {
  if (role === "staff") return Boolean(user.is_staff);
  if (role === "instructor")
    return Boolean(
      user.is_instructor || user.is_verified_instructor || user.is_staff,
    );
  return Boolean(user.is_student || user.is_staff || user.is_instructor);
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
      <Container className="py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Checking access…
        </p>
      </Container>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (!hasRole(user, role)) {
    return (
      <Container className="py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Restricted
        </p>
        <h1 className="mt-3 font-display text-3xl text-petrol">
          You do not have access
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          This area requires {role} permissions.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/account" variant="lime">
            Account
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
      </Container>
    );
  }

  return <>{children}</>;
}
