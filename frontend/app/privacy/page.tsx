import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { stubPages, site } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: stubPages.privacy.description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const c = stubPages.privacy;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14" width="md">
        <div className="prose-like space-y-4 text-sm leading-relaxed text-ink-muted md:text-base">
          <p>
            {site.name} processes account, enrollment, and payment-related data to
            deliver training services. Full legal copy will replace this placeholder
            before production launch.
          </p>
          <p>
            Contact channels for privacy requests will be listed here once institute
            contacts are published.
          </p>
        </div>
      </Container>
    </>
  );
}
