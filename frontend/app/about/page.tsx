import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { positioning, stubPages, site } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "About",
  description: stubPages.about.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const c = stubPages.about;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14 md:py-16">
        <div className="max-w-2xl space-y-5">
          <p className="text-lg text-ink leading-relaxed">{site.tagline}.</p>
          {positioning.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-ink-muted leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </Container>
    </>
  );
}
