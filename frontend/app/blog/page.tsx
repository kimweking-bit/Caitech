import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getBlogPosts } from "@/lib/api/content";
import { ApiError } from "@/lib/api/client";
import { mediaUrl } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Technical notes from CAITECH on CAD, BIM, engineering software, ICT and digital construction practice in Kenya.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "CAITECH Insights",
    description:
      "Editorial notes on technical programmes, tools and careers from CAITECH Global Institute.",
  },
};

type Search = { page?: string; search?: string };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const search = sp.search?.trim() || "";

  let error: string | null = null;
  let count = 0;
  let results: Awaited<ReturnType<typeof getBlogPosts>>["results"] = [];
  let next: string | null = null;
  let previous: string | null = null;

  try {
    const data = await getBlogPosts({
      page,
      search: search || undefined,
    });
    count = data.count;
    results = data.results;
    next = data.next;
    previous = data.previous;
  } catch (e) {
    error =
      e instanceof ApiError
        ? "We couldn't load the journal. Please try again."
        : "We couldn't load the journal. Please try again.";
  }

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="Insights from the institute"
        description="Notes on CAD, BIM, engineering software, ICT and digital construction — written for learners and practitioners in Kenya."
      />
      <Container className="py-10 md:py-14">
        {error ? (
          <div className="border border-line bg-surface px-6 py-14 text-center">
            <h2 className="font-display text-2xl text-petrol">
              We couldn&apos;t load the journal
            </h2>
            <p className="mt-3 text-sm text-ink-muted">{error}</p>
            <div className="mt-8">
              <Button href="/blog" variant="lime">
                Retry
              </Button>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="border border-line bg-surface px-6 py-16 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              Journal
            </p>
            <h2 className="mt-3 font-display text-2xl text-petrol md:text-3xl">
              {search
                ? "No articles match this search"
                : "Articles are being prepared"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
              {search
                ? "Try another term, or browse all published notes."
                : "Check back soon for technical notes on programmes, tools and practice."}
            </p>
            {search ? (
              <div className="mt-8">
                <Button href="/blog" variant="secondary">
                  Clear search
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                {count} article{count === 1 ? "" : "s"}
              </p>
              <form role="search" action="/blog" className="flex gap-2">
                <label htmlFor="blog-q" className="sr-only">
                  Search articles
                </label>
                <input
                  id="blog-q"
                  name="search"
                  type="search"
                  defaultValue={search}
                  placeholder="Search"
                  className="w-full max-w-xs border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-petrol focus-visible:ring-2 focus-visible:ring-lime/40"
                />
                <Button type="submit" variant="secondary">
                  Search
                </Button>
              </form>
            </div>

            <ul className="list-none space-y-0 divide-y divide-line border border-line p-0">
              {results.map((post) => {
                const img = mediaUrl(post.featured_image);
                const date = post.published_at || post.created_at;
                return (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid gap-4 p-5 no-underline transition-colors hover:bg-surface sm:grid-cols-[8rem_1fr] sm:items-start md:p-6"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-petrol/5 sm:aspect-square">
                        {img ? (
                          <Image
                            src={img}
                            alt=""
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-[linear-gradient(145deg,rgb(18_52_59/0.1),rgb(199_240_0/0.12))]"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                          {[
                            date
                              ? new Date(date).toLocaleDateString("en-KE", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : null,
                            post.categories?.[0],
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <h2 className="mt-2 font-display text-xl text-petrol group-hover:text-petrol-deep md:text-2xl">
                          {post.title}
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <span className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                          Read →
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {(next || previous) && (
              <nav
                className="mt-10 flex items-center justify-between border-t border-line pt-6"
                aria-label="Pagination"
              >
                {previous ? (
                  <Button
                    href={page > 2 ? `/blog?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}` : search ? `/blog?search=${encodeURIComponent(search)}` : "/blog"}
                    variant="secondary"
                  >
                    ← Previous
                  </Button>
                ) : (
                  <span />
                )}
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                  Page {page}
                </span>
                {next ? (
                  <Button
                    href={`/blog?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    variant="secondary"
                  >
                    Next →
                  </Button>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </Container>
    </>
  );
}
