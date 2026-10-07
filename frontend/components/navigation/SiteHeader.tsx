import Link from "next/link";
import { primaryNav, utilityNav } from "@/lib/content/nav";
import { Logo } from "@/components/navigation/Logo";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

export function SiteHeader() {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-line/80 bg-ground/90 backdrop-blur-md",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav
          className="hidden md:flex md:items-center md:gap-1 lg:gap-2"
          aria-label="Primary"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-2.5 py-2 text-sm text-ink-muted transition-colors",
                "hover:text-petrol focus-visible:text-petrol",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-2">
          {utilityNav.map((item) =>
            item.emphasis === "primary" ? (
              <Button key={item.href} href={item.href} variant="lime" size="sm">
                {item.label}
              </Button>
            ) : (
              <Button
                key={item.href}
                href={item.href}
                variant="ghost"
                size="sm"
              >
                {item.label}
              </Button>
            ),
          )}
        </div>

        <MobileNav />
      </Container>
    </header>
  );
}
