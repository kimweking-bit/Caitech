import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { stubPages } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};

export default function PaymentsReturnPage() {
  const c = stubPages.paymentsReturn;
  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <Container className="py-14">
        <p className="text-ink-muted">
          This page will poll order status via the payments API after checkout.
        </p>
        <div className="mt-8">
          <Button href="/" variant="secondary">
            Home
          </Button>
        </div>
      </Container>
    </>
  );
}
