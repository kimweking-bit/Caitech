import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "lime";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-petrol text-ground hover:bg-petrol-deep border border-petrol focus-visible:outline-lime",
  secondary:
    "bg-transparent text-petrol border border-petrol/30 hover:border-petrol hover:bg-surface",
  ghost:
    "bg-transparent text-petrol border border-transparent hover:bg-petrol/5",
  lime: "bg-lime text-lime-ink border border-lime hover:bg-lime-bright font-semibold",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = Common & {
  href: string;
  external?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center font-medium tracking-wide transition-colors duration-150",
    "rounded-[var(--radius-md)] disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variantClass[variant],
    sizeClass[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, external } = props;
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const {
    type = "button",
    disabled,
    onClick,
    name,
    value,
    form,
    formAction,
    "aria-label": ariaLabel,
  } = buttonProps;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      name={name}
      value={value}
      form={form}
      formAction={formAction}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
