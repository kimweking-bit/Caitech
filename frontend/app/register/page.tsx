"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError, fieldErrors } from "@/lib/api/client";

function safeNext(raw: string | null): string {
  if (!raw) return "/courses";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/courses";
  return raw;
}

function RegisterForm() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNext(search.get("next"));

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [authLoading, isAuthenticated, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    if (password.length < 8) {
      setFields({ password: "Use at least 8 characters." });
      return;
    }
    setSubmitting(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      router.replace(next);
    } catch (err) {
      setFields(fieldErrors(err));
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not create your account.",
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
          Register
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Create a CAITECH account to enrol in technical programmes.
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
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
            error={fields.email}
          />

          <Input
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={submitting}
            error={fields.password}
            hint="At least 8 characters."
          />

          <Button
            type="submit"
            variant="lime"
            className="w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-muted">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-petrol underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-sm text-ink-muted">
          Loading…
        </Container>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
