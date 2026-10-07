import Link from "next/link";
import { footerNav } from "@/lib/content/nav";
import { instituteContact } from "@/lib/content/institute";
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

  return (
    <footer className="border-t border-petrol-muted bg-petrol-deep text-ground">
      <Container className="py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverse compact />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ground/70">
              {site.tagline}. Technical training in CAD, engineering, ICT,
              electronics, construction technology and applied digital skills —
              Nairobi CBD.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterColumn title="Learn" links={footerNav.learn} />
            <FooterColumn
              title="Institution"
              links={[
                ...footerNav.institute,
                { label: "FAQs", href: "/faq" },
              ]}
            />
            <FooterColumn
              title="Student"
              links={footerNav.account.filter((l) => l.href !== "/cart")}
            />
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ground/55">
              Contact
            </p>
            <address className="mt-4 space-y-1 not-italic text-sm text-ground/85">
              {instituteContact.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
            <ul className="mt-4 space-y-1 text-sm">
              {instituteContact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    className="hover:text-lime"
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                  >
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  className="hover:text-lime"
                  href={`mailto:${instituteContact.email}`}
                >
                  {instituteContact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ground/50">
            © {year} {site.name}
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-[11px] text-ground/45">
            <Link href="/privacy" className="hover:text-lime">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-lime">
              Terms
            </Link>
            <span className="uppercase tracking-[0.12em]">
              Technical education · Kenya
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
