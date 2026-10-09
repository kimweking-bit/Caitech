"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import { portalHome } from "@/lib/portal/roles";

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination =
    safeNext(searchParams.get("next")) || portalHome(user) || "/student";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(destination);
    }
  }, [authLoading, isAuthenticated, destination, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await login(username.trim(), password);
      const next =
        safeNext(searchParams.get("next")) || portalHome(me) || "/student";
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = err.message || "";
        if (
          /no active account/i.test(msg) ||
          /credentials/i.test(msg) ||
          err.status === 401
        ) {
          setError(
            "Invalid username/email or password. Demo admin: demo.admin / CaitechDemo2026!",
          );
        } else {
          setError(msg || "Sign-in failed.");
        }
      } else {
        setError("Sign-in failed. Check that the API is running.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicShell>
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Account
          </p>
          <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">
            Sign in
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Use your username or email. Demo admin:{" "}
            <span className="font-mono text-petrol">demo.admin</span> /{" "}
            <span className="font-mono text-petrol">CaitechDemo2026!</span>
          </p>

          {error ? (
            <p
              className="mt-6 border border-line bg-surface px-4 py-3 text-sm text-petrol"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Input
              id="login-username"
              label="Username or email"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={submitting || authLoading}
            />
            <Input
              id="login-password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting || authLoading}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="submit" variant="lime" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
              <Link
                href="/forgot-password"
                className="text-sm text-petrol underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <p className="mt-10 text-sm text-ink-muted">
            No account?{" "}
            <Link
              href="/register"
              className="text-petrol underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </Container>
    </PublicShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PublicShell>
          <Container className="py-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Loading…
            </p>
          </Container>
        </PublicShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
