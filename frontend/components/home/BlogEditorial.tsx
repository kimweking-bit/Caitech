import Link from "next/link";
import Image from "next/image";
import { getRecentPosts } from "@/lib/api/content";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/utils/format";
import { blogTeaser } from "@/lib/content/stub-copy";

/** Homepage journal — live posts only. Omits section when empty. */
export async function BlogEditorial() {
  const posts = await getRecentPosts(3);
  if (posts.length === 0) return null;

  return (
    <Section
      id="insights"
      eyebrow={blogTeaser.eyebrow}
      title={blogTeaser.title}
      lede={blogTeaser.emptyBody}
    >
      <ul className="grid list-none grid-cols-1 gap-0 border border-line p-0 md:grid-cols-3">
        {posts.map((post, i) => {
          const img = mediaUrl(post.featured_image);
          const date = post.published_at || post.created_at;
          return (
            <li
              key={post.id}
              className={
                i > 0
                  ? "border-t border-line md:border-t-0 md:border-l"
                  : undefined
              }
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col no-underline outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-petrol/5">
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(145deg,rgb(18_52_59/0.1),rgb(199_240_0/0.1))]"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                    {[
                      date
                        ? new Date(date).toLocaleDateString("en-KE", {
                            month: "short",
                            day: "numeric",
                          })
                        : null,
                      post.categories?.[0],
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className="font-display text-lg leading-snug text-petrol group-hover:text-petrol-deep md:text-xl">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-auto pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                    Read →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-10">
        <Button href={blogTeaser.ctaHref} variant="lime">
          {blogTeaser.ctaLabel} →
        </Button>
      </div>
    </Section>
  );
}
