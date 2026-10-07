import { blogTeaser } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * Phase 1: empty-state only. Wire to site_content blog list in Phase 2.
 * No invented posts.
 */
export function BlogTeaser() {
  return (
    <Section eyebrow={blogTeaser.eyebrow} title={blogTeaser.title}>
      <div className="flex flex-col items-start justify-between gap-6 border border-line bg-surface p-6 md:flex-row md:items-center md:p-8">
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
          {blogTeaser.emptyBody}
        </p>
        <Button href={blogTeaser.ctaHref} variant="secondary">
          {blogTeaser.ctaLabel}
        </Button>
      </div>
    </Section>
  );
}
