"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listContactInquiries } from "@/lib/api/admin-ops";
import type { ContactInquiry } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";

export default function AdminInquiriesPage() {
  const [rows, setRows] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await listContactInquiries(1);
        if (!c) setRows(asList(data));
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load inquiries.",
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
        eyebrow="Inbox"
        title="Contact inquiries"
        description="Messages submitted through the public contact form."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No inquiries"
          description="New contact form submissions will appear here."
        />
      ) : null}
      <ul className="list-none space-y-3 p-0">
        {rows.map((r) => (
          <li key={r.id} className="border border-line bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl text-petrol">{r.name}</p>
              <p className="font-mono text-[11px] text-ink-muted">
                {r.created_at
                  ? new Date(r.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink-muted">
              {r.email}
              {r.phone ? ` · ${r.phone}` : ""}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink">
              {r.message}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
