"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/payments";
import type { Order } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { MetricCard, MetricGrid } from "@/components/portal/MetricGrid";
import { formatMoney } from "@/lib/utils/format";

type Filter = "all" | "paid" | "pending" | "failed";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const pages = await listOrders();
        if (!c) setOrders(pages);
      } catch (e) {
        if (!c)
          setError(e instanceof ApiError ? e.message : "Could not load payments.");
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((o) => {
      const st = (o.status || "").toLowerCase();
      const pay = (o.latest_transaction?.status || "").toLowerCase();
      if (filter === "paid" && !(st === "paid" || pay === "confirmed" || pay === "paid"))
        return false;
      if (
        filter === "pending" &&
        !(st === "pending" || pay === "pending" || pay === "initiated")
      )
        return false;
      if (filter === "failed" && !(st === "failed" || pay === "failed")) return false;
      if (!qq) return true;
      const hay = [
        o.reference,
        o.status,
        o.total,
        ...(o.items || []).map((i) => i.course_title),
        o.latest_transaction?.provider,
        o.latest_transaction?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [orders, filter, q]);

  const paid = orders.filter((o) => o.status === "paid").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const failed = orders.filter((o) => o.status === "failed").length;
  const revenue = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commerce"
        title="Orders & payments"
        description="Institution-wide checkout activity with paid, pending, and failed states."
      />

      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <MetricGrid>
            <MetricCard label="Orders" value={orders.length} />
            <MetricCard label="Paid" value={paid} />
            <MetricCard label="Pending" value={pending} />
            <MetricCard label="Failed" value={failed} />
            <MetricCard
              label="Paid volume"
              value={formatMoney(String(revenue), "KES") || "KES 0"}
              hint="Sum of paid order totals"
            />
          </MetricGrid>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["all", "All"],
                  ["paid", "Paid"],
                  ["pending", "Pending"],
                  ["failed", "Failed"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                    filter === id
                      ? "border-petrol bg-petrol text-lime"
                      : "border-line bg-surface text-ink-muted hover:text-petrol"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reference, course, provider…"
              className="w-full border border-line bg-surface px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matching orders"
              description="Adjust filters or wait for checkout activity."
            />
          ) : (
            <div className="overflow-x-auto border border-line bg-surface">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line bg-ground font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium">Items</th>
                    <th className="px-3 py-2 font-medium">Total</th>
                    <th className="px-3 py-2 font-medium">Order</th>
                    <th className="px-3 py-2 font-medium">Payment</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.reference} className="border-b border-line last:border-0">
                      <td className="px-3 py-2.5 font-mono text-[11px] text-petrol">
                        {String(o.reference).slice(0, 8)}…
                      </td>
                      <td className="max-w-[14rem] truncate px-3 py-2.5 text-ink">
                        {(o.items || []).map((i) => i.course_title).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {formatMoney(o.total, o.currency || "KES")}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-3 py-2.5">
                        {o.latest_transaction ? (
                          <span className="font-mono text-[11px] text-ink-muted">
                            {o.latest_transaction.provider} ·{" "}
                            <StatusBadge status={o.latest_transaction.status} />
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-ink-muted">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
