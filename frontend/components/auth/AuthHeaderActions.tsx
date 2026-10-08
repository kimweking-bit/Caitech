"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function AuthHeaderActions({ className }: { className?: string }) {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-hidden>
        <span className="h-8 w-16 animate-pulse rounded bg-line/50" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button href="/cart" variant="ghost" size="sm">
          Cart
        </Button>
        <Button href="/account" variant="ghost" size="sm">
          Account
        </Button>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center px-2.5 py-2 text-sm text-ink-muted transition-colors hover:text-petrol"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button href="/login" variant="ghost" size="sm">
        Log in
      </Button>
      <Button href="/register" variant="lime" size="sm">
        Register
      </Button>
    </div>
  );
}

export function AuthMobileLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <Link
          href="/cart"
          onClick={onNavigate}
          className="px-2 py-3 text-base text-petrol"
        >
          Cart
        </Link>
        <Link
          href="/account"
          onClick={onNavigate}
          className="px-2 py-3 text-base text-petrol"
        >
          My learning
        </Link>
        <button
          type="button"
          className="px-2 py-3 text-left text-base text-ink-muted"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <Link
        href="/login"
        onClick={onNavigate}
        className="px-2 py-3 text-base text-petrol"
      >
        Log in
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className="px-2 py-3 text-base font-medium text-petrol"
      >
        Register
      </Link>
    </div>
  );
}
