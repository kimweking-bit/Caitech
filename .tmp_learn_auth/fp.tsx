"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthFormTitle, AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
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
      variant="reset"
      eyebrow="Account recovery"
      headline="Reset access to your workspace."
      lead="Enter the email on your CAITECH account. If it matches our records, we will send reset instructions."
      detail="Secure recovery · CAITECH"
    >
      <AuthFormTitle
        title="Forgot password"
        description="We’ll email a secure link if the address is registered."
      />

      {sent ? (
        <div className="space-y-4 border border-line bg-ground px-4 py-5">
          <p className="text-sm text-petrol">
            If an account exists for that email, reset instructions are on the
            way. Check your inbox and spam folder.
          </p>
          <Link
            href="/login"
            className="inline-block font-medium text-petrol underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
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
            id="forgot-email"
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
            className="w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">
        <Link href="/login" className="text-petrol hover:underline">
          ← Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
