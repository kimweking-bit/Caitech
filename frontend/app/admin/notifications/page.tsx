"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listNotifications } from "@/lib/api/admin-ops";
import type { NotificationEvent } from "@/types/api";

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let x=false; (async()=>{ try { if(!x) setRows(asList(await listNotifications(1))); } catch(e){ if(!x) setError(e instanceof ApiError?e.message:"Could not load notifications."); } finally { if(!x) setLoading(false);} })(); return ()=>{x=true}; }, []);
  return (
    <div>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol">{error}</p> : null}
      <ul className="list-none divide-y divide-line border border-line p-0">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3 text-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{r.type || "event"} · {r.status} · {r.created_at ? new Date(r.created_at).toLocaleString() : ""}</p>
            <p className="mt-1 text-petrol">{r.recipient}</p>
            {r.error ? <p className="mt-1 text-ink-muted">{r.error}</p> : null}
          </li>
        ))}
        {!loading && rows.length === 0 ? <li className="px-4 py-8 text-center text-ink-muted">No notifications.</li> : null}
      </ul>
    </div>
  );
}
