import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Transparent circular mark — exterior white canvas removed. */
const LOGO_SRC = "/brand/caitech-logo-transparent.png";

/**
 * Official CAITECH emblem — freestanding circular mark (no white plate/box).
 * Artwork is a transparent PNG cropped tightly around the circle.
 */
export function Logo({
  className,
  compact = false,
  inverse = false,
  priority = false,
  showWordmark = true,
  size,
}: {
  className?: string;
  /** Slightly smaller mark (mobile drawer / dense chrome). */
  compact?: boolean;
  /** Light wordmark for dark grounds (footer). */
  inverse?: boolean;
  priority?: boolean;
  showWordmark?: boolean;
  size?: number;
}) {
  const markSize = size ?? (compact ? 36 : 44);

  return (
    <Link
      href="/"
      className={cn(
        "logo-mark group",
        inverse && "logo-mark--inverse",
        compact && "logo-mark--compact",
        className,
      )}
      aria-label="CAITECH home"
    >
      <span
        className="logo-mark__image-wrap"
        style={{ width: markSize, height: markSize }}
      >
        <Image
          src={LOGO_SRC}
          alt=""
          width={markSize}
          height={markSize}
          className="logo-mark__img"
          priority={priority}
          sizes={`${markSize}px`}
        />
      </span>
      {showWordmark ? (
        <span className="logo-mark__wordmark">
          <span className="logo-mark__name">CAITECH</span>
          <span className="logo-mark__tag">
            College of AI &amp; Technology
          </span>
        </span>
      ) : null}
    </Link>
  );
}
