import Link from "next/link";
import { footerContact, footerNav } from "@/lib/content/nav";
import { site } from "@/lib/content/stub-copy";
import { Logo } from "@/components/navigation/Logo";
import { Container } from "@/components/ui/Container";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ground/55">
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm text-ground/85 transition-colors hover:text-lime"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const hasContact =
    Boolean(footerContact.email) ||
    Boolean(footerContact.phone) ||
    Boolean(footerContact.locationLine);

  return (
    <footer className="border-t border-petrol-muted bg-petrol-deep text-ground">
      <Container className="py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverse />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ground/70">
              {site.tagline}. Career-relevant training in CAD, engineering, ICT,
              electronics, and construction technology.
            </p>
            {hasContact ? (
              <address className="mt-6 space-y-1 not-italic text-sm text-ground/75">
                {footerContact.locationLine ? (
                  <p>{footerContact.locationLine}</p>
                ) : null}
                {footerContact.email ? (
                  <p>
                    <a
                      className="hover:text-lime"
                      href={`mailto:${footerContact.email}`}
                    >
                      {footerContact.email}
                    </a>
                  </p>
                ) : null}
                {footerContact.phone ? (
                  <p>
                    <a
                      className="hover:text-lime"
                      href={`tel:${footerContact.phone.replace(/\s+/g, "")}`}
                    >
                      {footerContact.phone}
                    </a>
                  </p>
                ) : null}
              </address>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <FooterColumn title="Learn" links={footerNav.learn} />
            <FooterColumn title="Institute" links={footerNav.institute} />
            <FooterColumn title="Account" links={footerNav.account} />
            <FooterColumn title="Legal" links={footerNav.legal} />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ground/50">
            © {year} {site.name}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ground/45">
            Technical education · Kenya
          </p>
        </div>
      </Container>
    </footer>
  );
}
