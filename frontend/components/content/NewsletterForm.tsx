"use client";

import { FormEvent, useState } from "react";
import { subscribeNewsletter } from "@/lib/api/content";
import { ApiError, fieldErrors } from "@/lib/api/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function NewsletterForm({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await subscribeNewsletter(email.trim());
      setDone(true);
      setEmail("");
    } catch (err) {
      const fields = fieldErrors(err);
      setError(
        fields.email ||
          (err instanceof ApiError
            ? err.message
            : "Could not subscribe. Try again."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p
        className={cn("text-sm text-petrol", className)}
        role="status"
      >
        You are subscribed. Thank you.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        compact
          ? "flex flex-col gap-2 sm:flex-row sm:items-end"
          : "flex flex-col gap-3",
        className,
      )}
      noValidate
    >
      <div className={compact ? "min-w-0 flex-1" : undefined}>
        <Input
          id="newsletter-email"
          label={compact ? "Email" : "Work or personal email"}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          error={error || undefined}
        />
      </div>
      <Button
        type="submit"
        variant="lime"
        disabled={submitting}
        className={compact ? "shrink-0 justify-center" : "w-full justify-center sm:w-auto"}
      >
        {submitting ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
