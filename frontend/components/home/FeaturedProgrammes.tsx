import Image from "next/image";
import Link from "next/link";
import { featuredProgrammes } from "@/lib/content/institute";
import { featured } from "@/lib/content/stub-copy";
import { getFeaturedCourses } from "@/lib/api/courses";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CourseCard } from "@/components/courses/CourseCard";

/**
 * Featured programmes: prefer live API catalogue when seeded;
 * otherwise verified editorial programmes (no invented prices/duration).
 */
export async function FeaturedProgrammes() {
  const apiCourses = await getFeaturedCourses(6);
  const useApi = apiCourses.length > 0;

  return (
    <Section
      eyebrow="Programmes"
      title="Featured programmes"
      tone="surface"
      id="featured-courses"
      lede="Technical diplomas and certificates shaped around tools and work practices used in studios, sites and ops teams."
    >
      {useApi ? (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {apiCourses.map((course) => (
              <li key={course.slug}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href={featured.ctaHref} variant="secondary">
              Explore courses →
            </Button>
          </div>
        </>
      ) : (
        <>
          <ul className="grid gap-0 border border-line sm:grid-cols-2 lg:grid-cols-3">
            {featuredProgrammes.map((p, i) => (
              <li
                key={p.slug}
                className="group border-line bg-surface sm:border-r sm:odd:border-r lg:[&:nth-child(3n)]:border-r-0 border-b last:border-b-0"
              >
                <Link
                  href={p.href}
                  className="flex h-full flex-col no-underline"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-petrol/5">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute left-3 top-3">
                      <Badge tone="lime">{p.school}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                    <span className="font-mono text-[11px] tracking-[0.12em] text-ink-muted">
                      {p.number}
                    </span>
                    <h3 className="font-display text-xl leading-snug text-petrol group-hover:text-petrol-deep">
                      {p.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {p.blurb}
                    </p>
                    <span className="mt-auto pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                      View programme →
                    </span>
                  </div>
                </Link>
                {/* subtle separator rhythm on mobile */}
                <span className="sr-only">Programme {i + 1}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/courses" variant="lime">
              Explore courses →
            </Button>
            <Button href="/contact" variant="secondary">
              Ask about intakes
            </Button>
          </div>
        </>
      )}
    </Section>
  );
}
