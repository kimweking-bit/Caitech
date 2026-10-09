"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/payments";
import type { Order } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";

function tone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("success") || s.includes("complete"))
    return "success" as const;
  if (s.includes("fail") || s.includes("cancel")) return "danger" as const;
  if (s.includes("pend") || s.includes("init")) return "warning" as const;
  return "neutral" as const;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
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

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) =>
      String(o.status).toLowerCase().includes(filter),
    );
  }, [orders, filter]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Commerce"
        title="Orders & payments"
        description="Orders returned by the payments API for the authenticated staff session."
      />
      <div className="flex flex-wrap gap-2 border-b border-line pb-0">
        {["all", "paid", "pending", "fail", "cancel"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              "px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] " +
              (filter === f
                ? "border-b-2 border-petrol text-petrol"
                : "text-ink-muted")
            }
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && visible.length === 0 ? (
        <EmptyState
          title="No orders in this filter"
          description="Payment orders appear after checkout activity."
        />
      ) : null}
      {visible.length > 0 ? (
        <DataTable
          headers={[
            "Reference",
            "Items",
            "Total",
            "Status",
            "Provider",
            "Expiry / window",
          ]}
        >
          {visible.map((o) => (
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
