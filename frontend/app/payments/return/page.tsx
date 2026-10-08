"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

function ReturnInner() {
  const search = useSearchParams();
  const router = useRouter();
  const ref =
    search.get("order") ||
    search.get("reference") ||
    search.get("order_reference");

  useEffect(() => {
    if (ref) router.replace(`/orders/${ref}`);
  }, [ref, router]);

  return (
    <Container className="py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        Payment
      </p>
      <h1 className="mt-3 font-display text-2xl text-petrol">
        Returning from payment…
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        {ref
          ? "Opening your order status."
          : "If you completed payment, open your orders list to check status."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {ref ? (
          <Button href={`/orders/${ref}`} variant="lime">
            View order
          </Button>
        ) : (
          <Button href="/account/orders" variant="lime">
            Your orders
          </Button>
        )}
        <Button href="/courses" variant="secondary">
          Courses
        </Button>
      </div>
    </Container>
  );
}

export default function PaymentsReturnPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-sm text-ink-muted">
          Loading…
        </Container>
      }
    >
      <ReturnInner />
    </Suspense>
  );
}
