import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Intrinsic logo aspect from source artwork (square mark). */
const LOGO_INTRINSIC_W = 640;
const LOGO_INTRINSIC_H = 640;

type LogoProps = {
  className?: string;
  /** Inverse treatment for dark petrol surfaces */
  inverse?: boolean;
  /** Compact height for dense chrome */
  compact?: boolean;
};

/**
 * Real CAITECH institutional logo (circular mark + wordmark).
 * White plate on dark surfaces so the original artwork remains legible.
 */
export function Logo({ className, inverse = false, compact = false }: LogoProps) {
  const height = compact ? 36 : 44;
  const width = Math.round(height * (LOGO_INTRINSIC_W / LOGO_INTRINSIC_H));

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center no-underline",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        inverse ? "focus-visible:outline-lime" : "focus-visible:outline-petrol",
        className,
      )}
      aria-label="CAITECH Global Institute — home"
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          inverse &&
            "rounded-sm bg-white px-1.5 py-1 shadow-[0_0_0_1px_rgb(255_255_255/0.15)]",
        )}
      >
        <Image
          src="/brand/caitech-logo.png"
          alt="CAITECH Global Institute"
          width={width}
          height={height}
          className="h-auto w-auto object-contain"
          style={{ height, width: "auto" }}
          priority
        />
      </span>
    </Link>
  );
}
