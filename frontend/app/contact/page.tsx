import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { stubPages } from "@/lib/content/stub-copy";
import { footerContact } from "@/lib/content/nav";

export const metadata: Metadata = {
  title: "Contact",
  description: stubPages.contact.description,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const c = stubPages.contact;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14 md:py-16">
        <div className="max-w-lg space-y-4 border border-line bg-surface p-6 md:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Direct channels
          </p>
          {footerContact.locationLine ? (
            <p className="text-ink">{footerContact.locationLine}</p>
          ) : null}
          {footerContact.email ? (
            <p>
              <a className="text-petrol underline" href={`mailto:${footerContact.email}`}>
                {footerContact.email}
              </a>
            </p>
          ) : (
            <p className="text-sm text-ink-muted">
              Email and phone will appear here once the institute publishes them.
              Inquiry form wiring ships with the contact API in Phase 2.
            </p>
          )}
          {footerContact.phone ? (
            <p>
              <a
                className="text-petrol underline"
                href={`tel:${footerContact.phone.replace(/\s+/g, "")}`}
              >
                {footerContact.phone}
              </a>
            </p>
          ) : null}
        </div>
      </Container>
    </>
  );
}
