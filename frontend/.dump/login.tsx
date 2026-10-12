"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { portalHome } from "@/lib/portal/roles";
import type { AuthUser } from "@/types/api";

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(next ?? portalHome(user));
    }
  }, [authLoading, isAuthenticated, user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedIn: AuthUser = await login(identifier.trim(), password);
      router.replace(next ?? portalHome(loggedIn));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not sign you in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="login"
      title="Sign in"
      description="Use your username or email to open your CAITECH workspace."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {error ? (
          <div
            role="alert"
            className="border border-danger/25 bg-danger/5 px-3.5 py-3 text-sm text-danger"
          >
            {error}
          </div>
        ) : null}

        <Input
          id="identifier"
          label="Username or email"
          name="username"
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
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-6">
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
          Demo admin:{" "}
          <span className="text-petrol">admin</span> /{" "}
          <span className="text-petrol">admin123</span>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell variant="login" title="Sign in" description="Loading…">
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
