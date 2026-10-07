import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  const c = stubPages.cart;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14">
        <p className="text-ink-muted">Your cart is empty. Commerce UI ships in Phase 3.</p>
        <div className="mt-8">
          <Button href="/courses" variant="lime">
            Browse courses
          </Button>
        </div>
      </Container>
    </>
  );
}
