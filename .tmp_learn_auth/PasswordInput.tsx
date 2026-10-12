"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
};

export function PasswordInput({
  label,
  hint,
  error,
  id,
  className,
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full border bg-surface px-3 pr-16 text-base text-ink",
            "rounded-[var(--radius-md)] placeholder:text-ink-muted/70",
            "border-line focus:border-petrol focus:outline-none focus:ring-1 focus:ring-petrol",
            error && "border-danger focus:border-danger focus:ring-danger",
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petrol"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
