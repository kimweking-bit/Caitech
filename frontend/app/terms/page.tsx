import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { stubPages, site } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Terms of use",
  description: stubPages.terms.description,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const c = stubPages.terms;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14" width="md">
        <div className="space-y-4 text-sm leading-relaxed text-ink-muted md:text-base">
          <p>
            Use of the {site.name} website and enrolled programs is subject to
            institute policies. Complete terms will replace this placeholder before
            production launch.
          </p>
        </div>
      </Container>
    </>
  );
}
