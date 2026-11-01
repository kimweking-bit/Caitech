"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { portalHome } from "@/lib/portal/roles";

/**
 * Desktop header auth cluster — signed-out CTAs or signed-in portal shortcuts.
 * On /login and /register, suppress the matching CTA so the bar stays clean.
 */
export function AuthHeaderActions({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const { user, isAuthenticated, isLoading } = useAuth();
  const home = portalHome(user);

  if (isLoading) {
    return (
      <div
        className={cn(
          "hidden h-8 w-28 animate-pulse rounded-md bg-line/50 sm:block",
          className,
        )}
        aria-hidden
      />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={cn("hidden items-center gap-2 sm:flex", className)}>
        <Link
          href="/cart"
          className="px-2 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-petrol"
        >
          Cart
        </Link>
        <Button href={home} variant="secondary" size="sm">
          Dashboard
        </Button>
      </div>
    );
  }

  const onLogin = pathname === "/login" || pathname.startsWith("/login/");
  const onRegister =
    pathname === "/register" || pathname.startsWith("/register/");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!onLogin ? (
        <Button
          href="/login"
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Sign in
        </Button>
      ) : null}
      {!onRegister ? (
        <Button
          href="/register"
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Apply
        </Button>
      ) : (
        <Button
          href="/login"
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Sign in
        </Button>
      )}
    </div>
  );
}

/**
 * Mobile drawer auth links — same rules as desktop, stacked full-width.
 */
export function AuthMobileLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "/";
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const home = portalHome(user);

  if (isLoading) return null;

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col gap-1 border-t border-line p-4">
        <Link
          href="/cart"
          onClick={onNavigate}
          className="px-2 py-3 text-base font-medium text-ink"
        >
          Cart
        </Link>
        <Link
          href={home}
          onClick={onNavigate}
          className="px-2 py-3 text-base font-medium text-ink"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => {
            void logout();
            onNavigate?.();
          }}
          className="px-2 py-3 text-left text-base text-ink-muted"
        >
          Sign out
        </button>
      </div>
    );
  }

  const onLogin = pathname === "/login" || pathname.startsWith("/login/");
  const onRegister =
    pathname === "/register" || pathname.startsWith("/register/");

  return (
    <div className="flex flex-col gap-2 border-t border-line p-4">
      {!onLogin ? (
        <Link
          href="/login"
          onClick={onNavigate}
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-line bg-ground px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-petrol/30 hover:text-petrol"
        >
          Sign in
        </Link>
      ) : null}
      {!onRegister ? (
        <Link
          href="/register"
          onClick={onNavigate}
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-petrol px-4 py-2.5 text-sm font-semibold text-ground transition-colors hover:bg-petrol-deep"
        >
          Apply
        </Link>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-petrol px-4 py-2.5 text-sm font-semibold text-ground transition-colors hover:bg-petrol-deep"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
