import Link from "next/link";
import Image from "next/image";
import type { CourseCardModel } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
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
        "group flex h-full flex-col overflow-hidden border border-line bg-surface rounded-[var(--radius-md)]",
        "transition-colors hover:border-petrol/35",
        className,
      )}
    >
      <Link href={course.href} className="flex h-full flex-col no-underline">
        <div className="relative aspect-[16/10] overflow-hidden bg-petrol/5">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(135deg,rgb(18_52_59/0.08),rgb(199_240_0/0.12))]"
            />
          )}
          {course.categoryLabel ? (
            <div className="absolute left-3 top-3">
              <Badge tone="lime">{course.categoryLabel}</Badge>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-xl leading-snug text-petrol group-hover:text-petrol-deep">
            {course.title}
          </h3>

          <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {course.level ? (
              <div>
                <dt className="sr-only">Level</dt>
                <dd>{course.level}</dd>
              </div>
            ) : null}
            {course.durationLabel ? (
              <div>
                <dt className="sr-only">Duration</dt>
                <dd>{course.durationLabel}</dd>
              </div>
            ) : null}
            {course.deliveryMode ? (
              <div>
                <dt className="sr-only">Delivery</dt>
                <dd>{course.deliveryMode}</dd>
              </div>
            ) : null}
          </dl>

          {course.priceLabel ? (
            <p className="text-sm font-medium text-petrol">{course.priceLabel}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
