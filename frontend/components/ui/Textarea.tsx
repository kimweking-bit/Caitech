import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
};

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  rows = 4,
  ...rest
}: TextareaProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-[var(--radius-md)] border bg-surface px-3 py-2.5 text-base text-ink",
          "placeholder:text-ink-muted/70",
          "border-line focus:border-petrol focus:outline-none focus:ring-1 focus:ring-petrol",
          error && "border-danger focus:border-danger focus:ring-danger",
          className,
        )}
        {...rest}
      />
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
