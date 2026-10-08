"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/payments";
import { formatMoney } from "@/lib/utils/format";
import type { Order } from "@/types/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let x=false; (async()=>{ try { const list=await listOrders(); if(!x) setOrders(list); } catch(e){ if(!x) setError(e instanceof ApiError?e.message:"Could not load orders."); } finally { if(!x) setLoading(false);} })(); return ()=>{x=true}; }, []);
  return (
    <div>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol">{error}</p> : null}
      <ul className="list-none divide-y divide-line border border-line p-0">
        {orders.map((o) => (
          <li key={o.reference}>
            <Link href={"/orders/" + o.reference} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 no-underline">
              <div><p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{o.reference}</p>
                <p className="text-sm text-petrol">{o.items.map((i) => i.course_title).join(", ") || "Order"}</p></div>
              <div className="text-right"><p className="text-sm text-petrol">{formatMoney(o.total, o.currency)}</p>
                <p className="font-mono text-[11px] uppercase text-ink-muted">{o.status}</p></div>
            </Link>
          </li>
        ))}
        {!loading && orders.length === 0 ? <li className="px-4 py-8 text-center text-ink-muted">No orders.</li> : null}
      </ul>
    </div>
  );
}
