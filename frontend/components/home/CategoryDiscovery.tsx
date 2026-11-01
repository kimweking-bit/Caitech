import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/api/courses";
import { coursesCategoryHref } from "@/lib/content/nav";
import { disciplines } from "@/lib/content/institute";
import { resolveCategoryImage } from "@/lib/content/course-images";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

type Tile = {
  slug: string;
  name: string;
  number: string;
  summary: string;
  image: string;
  imageAlt: string;
};

/**
 * Official 8-category discovery grid (photography-led).
 * Prefer live API categories; fall back to disciplines taxonomy so the
 * homepage never shows a 6-school mismatch.
 */
export async function CategoryDiscovery() {
  let tiles: Tile[] = [];

  try {
    const data = await getCategories();
    if (data?.length) {
      tiles = data.map((c, i) => {
        const meta = disciplines.find((d) => d.id === c.slug);
        return {
          slug: c.slug,
          name: c.name,
          number: meta?.number ?? String(i + 1).padStart(2, "0"),
          summary: meta?.summary ?? "Practice-led technical programmes.",
          image: meta?.image ?? resolveCategoryImage(c.slug),
          imageAlt: meta?.imageAlt ?? `${c.name} at CAITECH`,
        };
      });
    }
  } catch {
    tiles = [];
  }

  if (tiles.length === 0) {
    tiles = disciplines.map((d) => ({
      slug: d.id,
      name: d.name,
      number: d.number,
      summary: d.summary,
      image: d.image,
      imageAlt: d.imageAlt,
    }));
  }

  return (
    <Section tone="ground" className="home-categories">
      <div className="home-categories__header">
        <Eyebrow>Programme areas</Eyebrow>
        <h2 className="home-categories__title">Eight technical disciplines.</h2>
        <p className="home-categories__lede">
          Explore CAITECH&apos;s official catalogue by practice area — MEP, BIM,
          quantity surveying, infrastructure, automation, energy, finance, and
          leadership.
        </p>
      </div>

      <div className="home-categories__grid">
        {tiles.map((t) => (
          <Link
            key={t.slug}
            href={coursesCategoryHref(t.slug)}
            className="home-categories__card group"
          >
            <div className="home-categories__media">
              <Image
                src={t.image}
                alt={t.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="home-categories__img object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <div className="home-categories__scrim" aria-hidden="true" />
              <span className="home-categories__num">{t.number}</span>
            </div>
            <div className="home-categories__body">
              <h3 className="home-categories__name">{t.name}</h3>
              <p className="home-categories__summary">{t.summary}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="home-categories__cta">
        <Button href="/courses" variant="secondary">
          View full catalogue
        </Button>
      </div>
    </Section>
  );
}
