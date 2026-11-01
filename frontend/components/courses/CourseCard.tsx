import Link from "next/link";
import Image from "next/image";
import type { CourseCardModel } from "@/types/api";
import { cn } from "@/lib/utils/cn";
import { displayTitle } from "@/lib/utils/display";
import { DEFAULT_COURSE_IMAGE, courseImageAlt } from "@/lib/content/course-images";

type Props = {
  course: CourseCardModel;
  className?: string;
  priority?: boolean;
};

/**
 * Photography-led course card.
 * Full-bleed cover with bottom gradient for title legibility.
 */
export function CourseCard({ course, className, priority = false }: Props) {
  const title = displayTitle(course.title);
  const src = course.imageUrl || DEFAULT_COURSE_IMAGE;
  const alt = courseImageAlt({
    title: course.title,
    categoryName: course.categoryLabel,
    categorySlug: course.categorySlug,
  });

  return (
    <article
      className={cn(
        "course-card-premium group relative flex flex-col overflow-hidden bg-white",
        className,
      )}
    >
      <Link href={course.href} className="flex h-full flex-col outline-none">
        <div className="course-card-premium__media relative aspect-[16/10] overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="course-card-premium__img object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="course-card-premium__scrim" aria-hidden="true" />
          {course.categoryLabel ? (
            <span className="course-card-premium__badge">{course.categoryLabel}</span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-muted">
            {course.levelLabel ? <span>{course.levelLabel}</span> : null}
            {course.levelLabel && course.durationLabel ? (
              <>
                <span aria-hidden>·</span>
                <span>{course.durationLabel}</span>
              </>
            ) : course.durationLabel ? (
              <span>{course.durationLabel}</span>
            ) : null}
          </div>

          <h3 className="font-display text-[1.28rem] leading-snug text-petrol group-hover:text-brand-blue transition-colors">
            {title}
          </h3>

          {course.description ? (
            <p className="line-clamp-2 text-[0.92rem] leading-relaxed text-ink-muted">
              {course.description}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div className="min-w-0">
              {course.priceLabel ? (
                <p className="font-display text-[1.05rem] text-petrol">{course.priceLabel}</p>
              ) : (
                <p className="text-sm text-ink-muted">See programme</p>
              )}
            </div>
            <span className="shrink-0 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-brand-blue opacity-80 transition-opacity group-hover:opacity-100">
              View →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
