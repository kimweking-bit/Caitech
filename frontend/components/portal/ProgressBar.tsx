import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className={cn("h-1.5 w-full bg-line", className)} aria-hidden>
      <div className="h-full bg-petrol" style={{ width: `${v}%` }} />
    </div>
  );
}
