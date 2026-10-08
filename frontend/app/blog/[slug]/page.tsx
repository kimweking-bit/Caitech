import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getBlogPost } from "@/lib/api/content";
import { ApiError } from "@/lib/api/client";
import { mediaUrl } from "@/lib/utils/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    if (!post) return { title: "Article not found" };
    const desc = (post.excerpt || post.body || "").slice(0, 160) || undefined;
    const img = mediaUrl(post.featured_image);
    return {
      title: post.title,
      description: desc,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description: desc,
        type: "article",
        url: `/blog/${post.slug}`,
        ...(img ? { images: [{ url: img }] } : {}),
      },
    };
  } catch {
    return { title: "Insights" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post = null;
  let loadError = false;
  try {
    post = await getBlogPost(slug);
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
          We couldn&apos;t load this article
        </h1>
        <div className="mt-8 flex justify-center gap-3">
          <Button href={`/blog/${slug}`} variant="lime">
            Retry
          </Button>
          <Button href="/blog" variant="secondary">
            All articles
          </Button>
        </div>
      </Container>
    );
  }

  if (!post) notFound();

  const img = mediaUrl(post.featured_image);
  const date = post.published_at || post.created_at;

  return (
    <article>
      <div className="border-b border-line bg-ground">
        <Container className="py-10 md:py-14">
          <p className="mb-6">
            <Link
              href="/blog"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted no-underline hover:text-petrol"
            >
              ← Journal
            </Link>
          </p>

          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            {[
              date
                ? new Date(date).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : null,
              ...(post.categories || []),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-4 mb-5 h-px w-12 bg-lime" aria-hidden />
          <h1 className="max-w-3xl font-display text-4xl text-balance text-petrol md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {post.excerpt}
            </p>
          ) : null}

          {img ? (
            <div className="relative mt-10 aspect-[21/9] max-w-4xl overflow-hidden border border-line bg-petrol/5">
              <Image
                src={img}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          ) : null}
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="whitespace-pre-line text-base leading-[1.75] text-ink">
            {post.body}
          </div>

          {post.tags?.length ? (
            <ul className="mt-12 flex list-none flex-wrap gap-2 border-t border-line p-0 pt-6">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-12">
            <Button href="/blog" variant="secondary">
              ← More articles
            </Button>
          </div>
        </div>
      </Container>
    </article>
  );
}
