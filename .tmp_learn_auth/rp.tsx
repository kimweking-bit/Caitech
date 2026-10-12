"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { confirmPasswordReset } from "@/lib/api/auth";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { AuthFormTitle, AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

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
    <AuthShell
      variant="reset"
      eyebrow="Account recovery"
      headline="Choose a new password."
      lead="Set a strong password for your CAITECH portal account, then sign in again."
      detail="Secure recovery · CAITECH"
    >
      <AuthFormTitle title="New password" />

      {done ? (
        <p className="text-sm text-petrol">
          Password updated. Redirecting to sign in…
        </p>
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
          <PasswordInput
            id="new-password"
            label="New password"
            name="new_password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            error={fields.new_password}
            hint="At least 8 characters."
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm password"
            name="new_password_confirm"
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

      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">
        <Link href="/login" className="text-petrol hover:underline">
          ← Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-ground font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Loading…
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
