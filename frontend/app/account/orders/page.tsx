"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { listOrders } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/utils/format";
import type { Order } from "@/types/api";

function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listOrders();
        if (!cancelled) setOrders(list);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Could not load orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container className="py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Account
      </p>
      <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">
        Orders
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Payment and enrolment history for your CAITECH account.
      </p>

      {loading ? (
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Loading…
        </p>
      ) : null}

      {error ? (
        <p className="mt-10 text-sm text-petrol" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="mt-10 border border-line px-6 py-12 text-center">
          <p className="font-display text-xl text-petrol">No orders yet</p>
          <div className="mt-6">
            <Button href="/courses" variant="lime">
              Browse courses
            </Button>
          </div>
        </div>
      ) : null}

      {orders.length > 0 ? (
        <ul className="mt-10 list-none divide-y divide-line border border-line p-0">
          {orders.map((o) => (
            <li key={o.reference}>
              <Link
                href={`/orders/${o.reference}`}
                className="flex flex-col gap-2 px-4 py-4 no-underline sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                    {o.reference}
                  </p>
                  <p className="mt-1 text-sm text-petrol">
                    {o.items.map((i) => i.course_title).join(", ") || "Order"}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString()
                      : null}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-petrol">
                    {formatMoney(o.total, o.currency)}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                    {o.status}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}

export default function AccountOrdersPage() {
  return (
    <RequireAuth>
      <OrdersView />
    </RequireAuth>
  );
}
