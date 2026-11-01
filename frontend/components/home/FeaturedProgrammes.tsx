import { featured } from "@/lib/content/stub-copy";
import { getFeaturedCourses, toCourseCard } from "@/lib/api/courses";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";

/**
 * Homepage featured strip. Uses live catalogue covers only.
 * Does not fall back to Unsplash stub photography (that masked API failures).
 */
export async function FeaturedProgrammes() {
  const live = await getFeaturedCourses(3);
  const courses = live.map(toCourseCard);

  return (
    <Section
      id="featured"
      eyebrow={featured.eyebrow}
      title={featured.title}
      lede={
        courses.length === 0
          ? featured.emptyBody
          : "Selected programmes from the live CAITECH catalogue."
      }
      tone="ground"
      className="featured-section"
    >
      {courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="font-display text-lg text-ink">{featured.emptyTitle}</p>
          <p className="mt-2 text-sm text-ink-muted">{featured.emptyBody}</p>
          <div className="mt-6 flex justify-center">
            <Button href={featured.ctaHref} variant="primary">
              {featured.ctaLabel}
            </Button>
          </div>
        </div>
      )}

      {courses.length > 0 ? (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <Button href={featured.ctaHref} variant="secondary">
            {featured.ctaLabel}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
