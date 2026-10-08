"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Container } from "@/components/ui/Container";
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
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Account
        </p>
        <h1 className="mt-3 font-display text-3xl text-petrol">
          Reset password
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Enter the email on your account. If it matches a registration, we
          will send reset instructions.
        </p>

        {done ? (
          <div className="mt-8 border border-line bg-surface px-5 py-6">
            <p className="text-sm text-petrol">
              If an account exists for that email, reset instructions have been
              sent. Check your inbox and spam folder.
            </p>
            <div className="mt-6">
              <Button href="/login" variant="secondary">
                Back to log in
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error ? (
              <p role="alert" className="text-sm text-petrol">
                {error}
              </p>
            ) : null}
            <Input
              id="email"
              label="Email"
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

        <p className="mt-8 text-sm text-ink-muted">
          <Link href="/login" className="text-petrol hover:underline">
            ← Log in
          </Link>
        </p>
      </div>
    </Container>
  );
}
