import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
  /** Inverse for petrol/dark surfaces */
  inverse?: boolean;
  /** Compact mark for dense headers */
  compact?: boolean;
};

/**
 * Text lockup — approved Phase 1 brand treatment until a vector mark lands.
 * Never invent a decorative “African” icon.
 */
export function Logo({ className, inverse = false, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 no-underline",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        inverse ? "focus-visible:outline-lime" : "focus-visible:outline-petrol",
        className,
      )}
      aria-label="CAITECH Global Institute — home"
    >
      <span
        aria-hidden
        className={cn(
          "grid h-8 w-8 place-items-center border font-mono text-[10px] font-semibold tracking-wider",
          inverse
            ? "border-lime/80 bg-petrol-deep text-lime"
            : "border-petrol bg-petrol text-lime",
        )}
      >
        CAI
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.05rem] tracking-[-0.02em]",
            inverse ? "text-ground" : "text-petrol",
          )}
        >
          CAITECH
        </span>
        {!compact ? (
          <span
            className={cn(
              "mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em]",
              inverse ? "text-ground/65" : "text-ink-muted",
            )}
          >
            Global Institute
          </span>
        ) : null}
      </span>
    </Link>
  );
}
