import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { CourseCard } from "@/components/courses/CourseCard";
import { CatalogueControls } from "@/components/courses/CatalogueControls";
import { Button } from "@/components/ui/Button";
import {
  getCategories,
  getCourses,
  toCourseCard,
} from "@/lib/api/courses";
import { ApiError } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse CAITECH technical programmes across CAD, engineering, ICT, electronics, construction, and design.",
  alternates: { canonical: "/courses" },
};

type Search = {
  search?: string;
  category?: string;
  ordering?: string;
  page?: string;
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const search = sp.search?.trim() || "";
  const category = sp.category || "";
  const ordering = sp.ordering || "";
  const page = Math.max(1, Number(sp.page) || 1);

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Technical programmes built for practical work"
        description="Browse CAITECH programmes across CAD, engineering, ICT, electronics, construction, design and more."
      />
      <Container className="py-10 md:py-14">
        <Suspense fallback={<ControlsSkeleton />}>
          <CatalogueShell
            search={search}
            category={category}
            ordering={ordering}
            page={page}
          />
        </Suspense>
      </Container>
    </>
  );
}

async function CatalogueShell({
  search,
  category,
  ordering,
  page,
}: {
  search: string;
  category: string;
  ordering: string;
  page: number;
}) {
  const categories = await getCategories();

  let errorMessage: string | null = null;
  let count = 0;
  let results: ReturnType<typeof toCourseCard>[] = [];
  let next: string | null = null;
  let previous: string | null = null;

  try {
    const data = await getCourses({
      page,
      search: search || undefined,
      category: category || undefined,
      ordering: ordering || undefined,
    });
    count = data.count;
    next = data.next;
    previous = data.previous;
    results = data.results.map(toCourseCard);
  } catch (e) {
    errorMessage =
      e instanceof ApiError
        ? "We couldn't load the programmes. Please try again."
        : "We couldn't load the programmes. Please try again.";
  }

  return (
    <div className="flex flex-col gap-10">
      <CatalogueControls
        categories={categories}
        activeCategory={category}
        activeSearch={search}
        activeOrdering={ordering}
      />

      {errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : results.length === 0 ? (
        <EmptyState filtered={Boolean(search || category)} />
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              {count} programme{count === 1 ? "" : "s"}
            </p>
          </div>

          <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <li key={c.id} className="min-w-0">
                <CourseCard course={c} />
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            hasNext={Boolean(next)}
            hasPrev={Boolean(previous)}
            search={search}
            category={category}
            ordering={ordering}
          />
        </>
      )}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="border border-line bg-surface px-6 py-16 text-center md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Courses
      </p>
      <h2 className="mt-3 font-display text-2xl text-petrol md:text-3xl">
        {filtered
          ? "No programmes match these filters"
          : "The programme catalogue is being prepared"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        {filtered
          ? "Try another category or clear search to see all published programmes."
          : "Check back soon for current CAITECH programmes across CAD, engineering, ICT, and construction technology."}
      </p>
      {filtered ? (
        <div className="mt-8">
          <Button href="/courses" variant="secondary">
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-line bg-surface px-6 py-16 text-center md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Unavailable
      </p>
      <h2 className="mt-3 font-display text-2xl text-petrol md:text-3xl">
        We couldn&apos;t load the programmes
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        {message}
      </p>
      <div className="mt-8">
        <Button href="/courses" variant="lime">
          Retry
        </Button>
      </div>
    </div>
  );
}

function Pagination({
  page,
  hasNext,
  hasPrev,
  search,
  category,
  ordering,
}: {
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
  search: string;
  category: string;
  ordering: string;
}) {
  if (!hasNext && !hasPrev) return null;

  function href(p: number) {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (category) sp.set("category", category);
    if (ordering) sp.set("ordering", ordering);
    if (p > 1) sp.set("page", String(p));
    const q = sp.toString();
    return q ? `/courses?${q}` : "/courses";
  }

  return (
    <nav
      className="flex items-center justify-between gap-4 border-t border-line pt-6"
      aria-label="Pagination"
    >
      {hasPrev ? (
        <Button href={href(page - 1)} variant="secondary">
          ← Previous
        </Button>
      ) : (
        <span />
      )}
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
        Page {page}
      </span>
      {hasNext ? (
        <Button href={href(page + 1)} variant="secondary">
          Next →
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}

function ControlsSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden>
      <div className="h-10 max-w-md animate-pulse bg-line/60" />
      <div className="flex gap-2">
        <div className="h-8 w-16 animate-pulse bg-line/60" />
        <div className="h-8 w-20 animate-pulse bg-line/60" />
        <div className="h-8 w-24 animate-pulse bg-line/60" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-line">
            <div className="aspect-[16/10] animate-pulse bg-line/50" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse bg-line/60" />
              <div className="h-6 w-4/5 animate-pulse bg-line/60" />
              <div className="h-4 w-full animate-pulse bg-line/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
