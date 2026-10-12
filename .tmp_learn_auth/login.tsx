"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthFormTitle, AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { portalHome } from "@/lib/portal/roles";
import type { AuthUser } from "@/types/api";

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNext(search.get("next"));

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function goAfterAuth(u: AuthUser | null | undefined) {
    router.replace(next || portalHome(u));
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      goAfterAuth(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    const id = identifier.trim();
    if (!id || !password) {
      setError("Enter your username or email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const me = await login(id, password);
      goAfterAuth(me);
    } catch (err) {
      setFields(fieldErrors(err));
      let msg =
        err instanceof ApiError ? err.message : "Could not sign you in.";
      if (
        /no active account/i.test(msg) ||
        /invalid credentials/i.test(msg) ||
        /unable to log in/i.test(msg)
      ) {
        msg = "Those credentials do not match our records.";
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="login"
      eyebrow="Portal access"
      headline="Build the skills behind what comes next."
      lead="Sign in to your CAITECH learning, teaching, or operations workspace."
      detail="Secure access · Nairobi CBD"
    >
      <AuthFormTitle
        title="Sign in"
        description="Use your CAITECH username or email."
      />

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error ? (
          <p
            role="alert"
            className="border border-line bg-ground px-3 py-2.5 text-sm text-petrol"
          >
            {error}
          </p>
        ) : null}

        <Input
          id="login-identifier"
          label="Username or email"
          name="username"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          disabled={submitting}
          error={fields.username || fields.email}
        />

        <div className="space-y-2">
          <PasswordInput
            id="login-password"
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            error={fields.password}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted underline-offset-4 hover:text-petrol hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="lime"
          className="w-full justify-center"
          disabled={submitting || authLoading}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-petrol underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-ground font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
