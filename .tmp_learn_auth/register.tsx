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

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function RegisterForm() {
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
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
      router.replace(next || portalHome(user));
    }
  }, [authLoading, isAuthenticated, next, router, user]);

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
      // AuthProvider auto-logs in after register; route by role
      router.replace(next || "/student");
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
      eyebrow="Join CAITECH"
      headline="Start your technical learning path."
      lead="Create an account to enrol in programmes, track progress, and access your learning workspace."
      detail="New learners · Kenya & beyond"
    >
      <AuthFormTitle
        title="Create account"
        description="You'll land in the student learning portal after registration."
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
          id="reg-username"
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
          id="reg-email"
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

        <PasswordInput
          id="reg-password"
          label="Password"
          name="password"
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
          disabled={submitting || authLoading}
        >
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-petrol underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-ground font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
