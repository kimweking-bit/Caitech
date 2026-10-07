import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";
import { instituteContact } from "@/lib/content/institute";

export const metadata: Metadata = {
  title: "Contact",
  description: stubPages.contact.description,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const c = stubPages.contact;
  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        description="Reach CAITECH for intakes, corporate training and programme questions."
      />
      <Container className="py-14 md:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 border border-line bg-surface p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Campus
            </p>
            <address className="not-italic text-ink leading-relaxed">
              {instituteContact.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
            <ul className="space-y-2 text-sm">
              {instituteContact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    className="text-petrol underline-offset-2 hover:underline"
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                  >
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  className="text-petrol underline-offset-2 hover:underline"
                  href={`mailto:${instituteContact.email}`}
                >
                  {instituteContact.email}
                </a>
              </li>
            </ul>
            <div className="pt-2">
              <Button href={instituteContact.mapsUrl} external variant="secondary">
                Get directions →
              </Button>
            </div>
          </div>
          <div className="border border-dashed border-line bg-ground/50 p-6 md:p-8">
            <p className="font-display text-xl text-petrol">Inquiry form</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Structured contact form wires to the site_content inquiry API in a
              later phase. Use phone or email for now.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
