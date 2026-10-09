"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/payments";
import type { Order } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

function tone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("success") || s.includes("complete"))
    return "success" as const;
  if (s.includes("fail") || s.includes("cancel")) return "danger" as const;
  if (s.includes("pend") || s.includes("init")) return "warning" as const;
  return "neutral" as const;
}

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await listOrders();
        if (!c) setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load orders.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Commerce"
        title="Orders & payments"
        description="Your CAITECH order history from the payments API."
        actions={
          <Button href="/courses" variant="secondary">
            Browse programmes
          </Button>
        }
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you check out a programme, orders appear here."
        />
      ) : null}
      {!loading && orders.length > 0 ? (
        <DataTable
          headers={[
            "Reference",
            "Items",
            "Total",
            "Status",
            "Payment",
            "Date",
          ]}
        >
          {orders.map((o) => (
            <tr key={o.reference}>
              <Td>
                <span className="font-mono text-xs text-petrol">
                  {o.reference}
                </span>
              </Td>
              <Td>
                {(o.items || [])
                  .map((i) => i.course_title)
                  .filter(Boolean)
                  .join(", ") || "—"}
              </Td>
              <Td className="font-mono text-xs">
                {o.currency} {o.total}
              </Td>
              <Td>
                <StatusBadge tone={tone(o.status)}>{o.status}</StatusBadge>
              </Td>
              <Td className="font-mono text-xs text-ink-muted">
                {o.latest_transaction
                  ? `${o.latest_transaction.provider} · ${o.latest_transaction.status}`
                  : "—"}
              </Td>
              <Td className="font-mono text-xs text-ink-muted">
                {o.expires_at
                  ? new Date(o.expires_at).toLocaleString()
                  : "—"}
              </Td>
            </tr>
          ))}
        </DataTable>
      ) : null}
    </div>
  );
}
