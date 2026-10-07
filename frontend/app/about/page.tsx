import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { positioning, stubPages, site } from "@/lib/content/stub-copy";
import {
  instituteMission,
  instituteVision,
  instituteContact,
} from "@/lib/content/institute";

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
        <div className="max-w-2xl space-y-8">
          <p className="text-lg text-ink leading-relaxed">{site.tagline}.</p>
          {positioning.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-ink-muted leading-relaxed">
              {p}
            </p>
          ))}
          <div className="grid gap-6 border border-line bg-surface p-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                Vision
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {instituteVision}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                Mission
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {instituteMission}
              </p>
            </div>
          </div>
          <p className="text-sm text-ink-muted">
            {instituteContact.addressLines.join(" · ")} ·{" "}
            <a className="text-petrol underline" href={`mailto:${instituteContact.email}`}>
              {instituteContact.email}
            </a>
          </p>
        </div>
      </Container>
    </>
  );
}
