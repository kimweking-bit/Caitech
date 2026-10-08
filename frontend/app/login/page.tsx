"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError, fieldErrors } from "@/lib/api/client";

function LoginForm() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/courses";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    router.replace(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace(next);
    } catch (err) {
      setFields(fieldErrors(err));
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not sign in. Check your credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Account
        </p>
        <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">
          Log in
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Access your cart, orders, and programme enrolments.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          {error ? (
            <p
              role="alert"
              className="border border-line bg-surface px-3 py-2 text-sm text-petrol"
            >
              {error}
            </p>
          ) : null}

          <Input
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={submitting}
            error={fields.username}
          />

          <Input
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            error={fields.password}
          />

          <div className="flex items-center justify-between gap-3">
            <Link
              href="/forgot-password"
              className="text-sm text-ink-muted underline-offset-2 hover:text-petrol hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="lime"
            className="w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-muted">
          New to CAITECH?{" "}
          <Link
            href="/register"
            className="text-petrol underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-sm text-ink-muted">
          Loading…
        </Container>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
