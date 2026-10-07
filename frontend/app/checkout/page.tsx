import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  const c = stubPages.checkout;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14">
        <p className="text-ink-muted">
          Payment initiation stays on CAITECH APIs. Provider callbacks are backend-only.
        </p>
        <div className="mt-8">
          <Button href="/cart" variant="secondary">
            Back to cart
          </Button>
        </div>
      </Container>
    </>
  );
}
