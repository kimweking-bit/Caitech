import Image from "next/image";
import Link from "next/link";
import { editorialArticles } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function BlogEditorial() {
  const featured =
    editorialArticles.find((a) => a.featured) ?? editorialArticles[0];
  const rest = editorialArticles.filter((a) => a.slug !== featured.slug);

  return (
    <Section
      eyebrow="Insights"
      title="From the institute"
      lede="Technical notes and career guidance from CAITECH’s public knowledge archive."
      id="insights"
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <article className="group border border-line bg-surface lg:col-span-7">
          <Link href={featured.href} className="block no-underline">
            {featured.image ? (
              <div className="relative aspect-[16/10] overflow-hidden bg-petrol/5">
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ) : null}
            <div className="p-6 md:p-8">
              <Badge tone="petrol">{featured.category}</Badge>
              <h3 className="mt-4 font-display text-2xl text-petrol text-balance md:text-3xl group-hover:text-petrol-deep">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
                {featured.excerpt}
              </p>
              <span className="mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                Read article →
              </span>
            </div>
          </Link>
        </article>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {rest.map((article, i) => (
            <article
              key={article.slug}
              className="flex flex-1 flex-col border border-line bg-surface p-5 md:p-6"
            >
              <Link href={article.href} className="flex h-full flex-col no-underline">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="outline">{article.category}</Badge>
                  <span className="font-mono text-[10px] text-ink-muted">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl leading-snug text-petrol">
                  {article.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                  {article.excerpt}
                </p>
                <span className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                  Read →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Button href="/blog" variant="secondary">
          Browse all insights →
        </Button>
      </div>
    </Section>
  );
}
