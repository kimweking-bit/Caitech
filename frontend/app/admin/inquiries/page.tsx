"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listInquiries } from "@/lib/api/admin-ops";
import type { ContactInquiry } from "@/types/api";

export default function AdminInquiriesPage() {
  const [rows, setRows] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let x=false; (async()=>{ try { if(!x) setRows(asList(await listInquiries(1))); } catch(e){ if(!x) setError(e instanceof ApiError?e.message:"Could not load inquiries."); } finally { if(!x) setLoading(false);} })(); return ()=>{x=true}; }, []);
  return (
    <div>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol">{error}</p> : null}
      <ul className="list-none divide-y divide-line border border-line p-0">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{r.created_at ? new Date(r.created_at).toLocaleString() : ""} · {r.email}</p>
            <p className="mt-1 text-sm font-medium text-petrol">{r.name}{r.phone ? " · " + r.phone : ""}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{r.message}</p>
          </li>
        ))}
        {!loading && rows.length === 0 ? <li className="px-4 py-8 text-center text-ink-muted">No inquiries.</li> : null}
      </ul>
    </div>
  );
}
