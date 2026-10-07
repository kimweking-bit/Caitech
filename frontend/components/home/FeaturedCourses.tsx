import { featured } from "@/lib/content/stub-copy";
import { getFeaturedCourses } from "@/lib/api/courses";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses(6);

  return (
    <Section
      eyebrow={featured.eyebrow}
      title={featured.title}
      tone="surface"
      id="featured-courses"
    >
      {courses.length === 0 ? (
        <div className="border border-dashed border-line bg-ground/60 px-6 py-12 text-center md:px-10">
          <p className="font-display text-2xl text-petrol">
            {featured.emptyTitle}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted md:text-base">
            {featured.emptyBody}
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={featured.ctaHref} variant="secondary">
              {featured.ctaLabel}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.slug}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href={featured.ctaHref} variant="secondary">
              {featured.ctaLabel}
            </Button>
          </div>
        </>
      )}
    </Section>
  );
}
