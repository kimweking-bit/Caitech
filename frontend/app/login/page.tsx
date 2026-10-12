"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthError, AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { AuthUser } from "@/types/api";
import { portalHome } from "@/lib/portal/roles";

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { user, loading, isAuthenticated, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace(next ?? portalHome(user));
    }
  }, [loading, isAuthenticated, user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedIn: AuthUser = await login(identifier.trim(), password);
      router.replace(next ?? portalHome(loggedIn));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      tone="login"
      variant="login"
      title="Sign in"
      detail="Use your CAITECH username or email to continue."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <AuthError message={error} /> : null}

        <Input
          id="identifier"
          label="Username or email"
          name="identifier"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={submitting}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            id="password"
            label="Password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="lime"
          size="lg"
          className="mt-1 w-full justify-center"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm text-ink-muted">
          New to CAITECH?{" "}
          <Link
            href="/register"
            className="font-medium text-petrol underline decoration-line underline-offset-4 transition-colors hover:decoration-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-wide text-ink-muted/80">
          Student, instructor, and admin portals open according to your account role.
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell tone="login" variant="login" title="Sign in" detail="Loading...">
          <div
            className="h-40 animate-pulse rounded-[var(--radius-md)] bg-line/40"
            aria-hidden
          />
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
