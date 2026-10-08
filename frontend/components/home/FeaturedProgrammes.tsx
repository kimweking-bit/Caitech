import Image from "next/image";
import Link from "next/link";
import { featuredProgrammes } from "@/lib/content/institute";
import { featured } from "@/lib/content/stub-copy";
import { getFeaturedCourses, toCourseCard } from "@/lib/api/courses";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";

/**
 * Live API when seeded; editorial homepage fallback only.
 * /courses never uses editorial fallback.
 */
export async function FeaturedProgrammes() {
  const live = await getFeaturedCourses(3);
  const useLive = live.length > 0;

  return (
    <Section
      id="featured-programmes"
      eyebrow={featured.eyebrow}
      title={featured.title}
      lede={featured.emptyBody}
    >
      {useLive ? (
        <>
          <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
            {live.map((c) => (
              <li key={c.id} className="min-w-0">
                <CourseCard course={toCourseCard(c)} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href={featured.ctaHref} variant="lime">
              {featured.ctaLabel}
            </Button>
          </div>
        </>
      ) : (
        <>
          <ul className="grid list-none grid-cols-1 gap-0 border border-line p-0 md:grid-cols-3">
            {featuredProgrammes.slice(0, 3).map((p, i) => (
              <li
                key={p.slug}
                className={
                  i > 0
                    ? "border-t border-line md:border-t-0 md:border-l"
                    : undefined
                }
              >
                <Link
                  href={p.href}
                  className="group flex h-full flex-col no-underline outline-none focus-visible:ring-2 focus-visible:ring-lime"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-petrol/5">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.imageAlt || ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                      {p.number} · {p.school}
                    </p>
                    <h3 className="font-display text-xl leading-snug text-petrol group-hover:text-petrol-deep">
                      {p.title}
                    </h3>
                    {p.blurb ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">
                        {p.blurb}
                      </p>
                    ) : null}
                    <span className="mt-auto pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                      View programme →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={featured.ctaHref} variant="lime">
              {featured.ctaLabel}
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
