"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { portalHome } from "@/lib/portal/roles";

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function RegisterForm() {
  const { register, user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = safeNext(params.get("next"));
  const next = nextParam ?? (user ? portalHome(user) : "/student");

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
    <AuthShell
      variant="register"
      title="Create account"
      description="Register with a username, email, and password to begin your CAITECH pathway."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? (
          <div
            role="alert"
            className="border border-danger/25 bg-danger/5 px-3.5 py-3 text-sm text-danger"
          >
            {error}
          </div>
        ) : null}

        <Input
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
          error={fields.username}
        />

        <Input
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          error={fields.email}
        />

        <PasswordInput
          id="password"
          label="Password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          error={fields.password}
          hint="At least 8 characters."
        />

        <Button
          type="submit"
          variant="lime"
          size="lg"
          className="mt-1 w-full justify-center"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-xs leading-relaxed text-ink-muted">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-petrol underline decoration-line underline-offset-2 hover:decoration-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-petrol underline decoration-line underline-offset-2 hover:decoration-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            Privacy
          </Link>{" "}
          policies.
        </p>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm text-ink-muted">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-petrol underline decoration-line underline-offset-4 transition-colors hover:decoration-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          variant="register"
          title="Create account"
          description="Loading..."
        >
          <div
            className="h-40 animate-pulse rounded-[var(--radius-md)] bg-line/40"
            aria-hidden
          />
        </AuthShell>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
