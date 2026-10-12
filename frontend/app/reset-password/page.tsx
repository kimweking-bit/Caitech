"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { confirmPasswordReset } from "@/lib/api/auth";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const missing = !uid || !token;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    if (password !== confirm) {
      setFields({ new_password_confirm: "Passwords do not match." });
      return;
    }
    if (password.length < 8) {
      setFields({ new_password: "Use at least 8 characters." });
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
        err instanceof ApiError
          ? err.message
          : "Could not update your password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="reset"
      title="Set new password"
      description="Choose a strong password for your CAITECH account."
    >
      {missing ? (
        <div
          role="alert"
          className="border border-danger/25 bg-danger/5 px-3.5 py-3 text-sm text-danger"
        >
          This reset link is incomplete or invalid. Request a new one from the
          forgot-password page.
        </div>
      ) : done ? (
        <div className="border border-line bg-surface px-4 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-lime-ink/70">
            Password updated
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Your password has been changed. Redirecting you to sign in...
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

          <PasswordInput
            id="password"
            label="New password"
            name="new_password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            error={fields.new_password}
          />

          <PasswordInput
            id="confirm"
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
            size="lg"
            className="w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Update password"}
          </Button>
        </form>
      )}

      <div className="mt-8 border-t border-line pt-6">
        <p className="text-sm text-ink-muted">
          <Link
            href="/login"
            className="font-medium text-petrol underline decoration-line underline-offset-4 transition-colors hover:decoration-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell variant="reset" title="Set new password" description="Loading...">
          <div
            className="h-24 animate-pulse rounded-[var(--radius-md)] bg-line/40"
            aria-hidden
          />
        </AuthShell>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
