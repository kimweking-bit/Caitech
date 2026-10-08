"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { confirmPasswordReset } from "@/lib/api/auth";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetForm() {
  const search = useSearchParams();
  const router = useRouter();
  const uid = search.get("uid") || "";
  const token = search.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    if (!uid || !token) {
      setError("This reset link is incomplete. Request a new one.");
      return;
    }
    if (password !== confirm) {
      setFields({ new_password_confirm: "Passwords do not match." });
      return;
    }
    setSubmitting(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: password,
        new_password_confirm: confirm,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setFields(fieldErrors(err));
      setError(
        err instanceof ApiError ? err.message : "Could not reset password.",
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
          Choose a new password
        </h1>

        {done ? (
          <p className="mt-8 text-sm text-petrol">
            Password updated. Redirecting to log in…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error ? (
              <p role="alert" className="text-sm text-petrol">
                {error}
              </p>
            ) : null}
            <Input
              id="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              error={fields.new_password}
            />
            <Input
              id="confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              error={fields.new_password_confirm}
            />
            <Button
              type="submit"
              variant="lime"
              className="w-full justify-center"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Update password"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-sm">
          <Link href="/login" className="text-petrol hover:underline">
            ← Log in
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-sm text-ink-muted">
          Loading…
        </Container>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
