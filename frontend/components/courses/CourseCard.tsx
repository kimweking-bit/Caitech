import Link from "next/link";
import Image from "next/image";
import type { CourseCardModel } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export function CourseCard({
  course,
  className,
}: {
  course: CourseCardModel;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col border border-line bg-surface",
        "transition-colors hover:border-petrol/40",
        className,
      )}
    >
      <Link
        href={course.href}
        className="flex h-full flex-col no-underline outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-petrol/5">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(145deg,rgb(18_52_59/0.12),rgb(18_52_59/0.04)_40%,rgb(199_240_0/0.14))]"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            {course.categoryLabel ? (
              <span className="text-petrol">{course.categoryLabel}</span>
            ) : null}
            {course.level ? (
              <>
                {course.categoryLabel ? <span aria-hidden>·</span> : null}
                <span>{course.level}</span>
              </>
            ) : null}
            {course.durationLabel ? (
              <>
                <span aria-hidden>·</span>
                <span>{course.durationLabel}</span>
              </>
            ) : null}
          </div>

          <h3 className="font-display text-[1.35rem] leading-snug text-petrol group-hover:text-petrol-deep md:text-xl">
            {course.title}
          </h3>

          {course.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {course.description}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
            <div className="min-w-0">
              {course.priceLabel ? (
                <p className="text-sm font-medium text-petrol">
                  {course.originalPriceLabel ? (
                    <span className="mr-2 text-ink-muted line-through">
                      {course.originalPriceLabel}
                    </span>
                  ) : null}
                  {course.priceLabel}
                </p>
              ) : null}
              {course.rating != null ? (
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {course.rating.toFixed(1)} · {course.reviewCount} reviews
                </p>
              ) : null}
            </div>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
              View →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
