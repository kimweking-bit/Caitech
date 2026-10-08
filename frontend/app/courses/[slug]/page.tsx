import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CoursePurchaseActions } from "@/components/courses/CoursePurchaseActions";
import { getCourseBySlug } from "@/lib/api/courses";
import { formatMoney, mediaUrl } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await getCourseBySlug(slug);
    if (!course) return { title: "Programme not found" };
    const desc =
      (course.short_description || course.description || "").slice(0, 160) ||
      undefined;
    const img = mediaUrl(course.image);
    return {
      title: course.title,
      description: desc,
      alternates: { canonical: `/courses/${course.slug}` },
      openGraph: {
        title: course.title,
        description: desc,
        url: `/courses/${course.slug}`,
        ...(img ? { images: [{ url: img }] } : {}),
      },
    };
  } catch {
    return { title: "Courses" };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  let course = null;
  let loadError = false;
  try {
    course = await getCourseBySlug(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    loadError = true;
  }

  if (loadError) {
    return (
      <Container className="py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Unavailable
        </p>
        <h1 className="mt-3 font-display text-3xl text-petrol">
          We couldn&apos;t load this programme
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Please try again shortly.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href={`/courses/${slug}`} variant="lime">
            Retry
          </Button>
          <Button href="/courses" variant="secondary">
            Back to catalogue
          </Button>
        </div>
      </Container>
    );
  }

  if (!course) notFound();

  const image = mediaUrl(course.image);
  const currency = course.currency || "KES";
  const priceLabel = course.is_free
    ? "Free"
    : formatMoney(course.price, currency);
  const original =
    !course.is_free && course.original_price
      ? formatMoney(course.original_price, currency)
      : null;

  const delivery =
    Array.isArray(course.delivery_modes) && course.delivery_modes.length
      ? course.delivery_modes.join(" · ")
      : null;

  const durationLabel =
    course.duration ||
    (course.total_duration_hours > 0
      ? `${course.total_duration_hours} hours`
      : null);

  const meta = [
    course.level ? { label: "Level", value: course.level } : null,
    delivery ? { label: "Delivery", value: delivery } : null,
    durationLabel ? { label: "Duration", value: durationLabel } : null,
    course.course_type ? { label: "Type", value: course.course_type } : null,
    course.intake_status
      ? { label: "Intake", value: course.intake_status }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const sections = course.sections ?? [];
  const lessons = course.lessons ?? [];
  const lede = course.short_description || course.description || "";
  const outcomes = course.learning_outcomes?.trim() || "";

  return (
    <>
      <div className="border-b border-line bg-ground">
        <Container className="py-10 md:py-14">
          <p className="mb-6">
            <Link
              href="/courses"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted no-underline hover:text-petrol"
            >
              ← Courses
            </Link>
          </p>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                {[course.category_name, course.course_type]
                  .filter(Boolean)
                  .join(" · ") || "Programme"}
              </p>
              <div className="mt-4 mb-5 h-px w-12 bg-lime" aria-hidden />
              <h1 className="font-display text-4xl text-balance text-petrol md:text-5xl">
                {course.title}
              </h1>
              {lede ? (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
                  {lede}
                </p>
              ) : null}

              {meta.length > 0 ? (
                <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {meta.map((m) => (
                    <div key={m.label} className="border-t border-line pt-3">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                        {m.label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium capitalize text-petrol">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div>
                  {original ? (
                    <p className="text-sm text-ink-muted line-through">
                      {original}
                    </p>
                  ) : null}
                  {priceLabel ? (
                    <p className="text-xl font-medium text-petrol">
                      {priceLabel}
                    </p>
                  ) : null}
                </div>
                <CoursePurchaseActions
                  courseId={course.id}
                  slug={course.slug}
                  isAvailable={course.is_available}
                  isFree={course.is_free}
                />
                {course.whatsapp_inquiry_url ? (
                  <Button href={course.whatsapp_inquiry_url} variant="secondary">
                    WhatsApp
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden border border-line bg-petrol/5">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(145deg,rgb(18_52_59/0.14),rgb(199_240_0/0.1))]"
                />
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-12">
            {course.description ? (
              <section aria-labelledby="overview-heading">
                <h2
                  id="overview-heading"
                  className="font-display text-2xl text-petrol"
                >
                  Programme overview
                </h2>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-muted">
                  {course.description}
                </p>
              </section>
            ) : null}

            {outcomes ? (
              <section aria-labelledby="outcomes-heading">
                <h2
                  id="outcomes-heading"
                  className="font-display text-2xl text-petrol"
                >
                  What you will learn
                </h2>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-muted">
                  {outcomes}
                </p>
              </section>
            ) : null}

            {sections.length > 0 ? (
              <section aria-labelledby="sections-heading">
                <h2
                  id="sections-heading"
                  className="font-display text-2xl text-petrol"
                >
                  Curriculum
                </h2>
                <ol className="mt-6 list-none space-y-3 p-0">
                  {sections
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((s, i) => (
                      <li
                        key={s.id}
                        className="flex gap-4 border-b border-line py-3"
                      >
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium text-petrol">
                          {s.title}
                        </span>
                      </li>
                    ))}
                </ol>
              </section>
            ) : null}

            {lessons.length > 0 ? (
              <section aria-labelledby="lessons-heading">
                <h2
                  id="lessons-heading"
                  className="font-display text-2xl text-petrol"
                >
                  Lessons
                </h2>
                <ul className="mt-6 list-none space-y-2 p-0">
                  {lessons
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((l) => (
                      <li
                        key={l.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2.5"
                      >
                        <span className="text-sm text-ink">{l.title}</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                          {[
                            l.duration_minutes
                              ? `${l.duration_minutes} min`
                              : null,
                            l.is_preview ? "Preview" : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Instructor
              </p>
              <p className="mt-2 text-sm font-medium text-petrol">
                {course.instructor_username || "CAITECH faculty"}
              </p>
              {course.review_count > 0 && course.average_rating != null ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {course.average_rating.toFixed(1)} average ·{" "}
                  {course.review_count} reviews
                </p>
              ) : null}
            </div>

            <div className="border border-line bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Next step
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Enrolment and checkout open in a later release. Contact the
                institute to join an intake.
              </p>
              <div className="mt-4">
                <Button
                  href="/contact"
                  variant="lime"
                  className="w-full justify-center"
                >
                  Contact admissions
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
