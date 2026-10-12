"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start password reset.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="forgot"
      title="Reset password"
      description="Enter the email on your account. If it matches a CAITECH profile, we will send reset instructions."
    >
      {done ? (
        <div className="border border-line bg-surface px-4 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-lime-ink/70">
            Request sent
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            If an account exists for{" "}
            <span className="font-medium text-petrol">{email}</span>, check your
            inbox for a reset link. The message may take a few minutes to
            arrive.
          </p>
        </div>
      ) : (
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
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />

          <Button
            type="submit"
            variant="lime"
            size="lg"
            className="w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <div className="mt-8 border-t border-line pt-6">
        <p className="text-sm text-ink-muted">
          <Link
            href="/login"
            className="font-medium text-petrol underline decoration-line underline-offset-4 transition-colors hover:decoration-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
