"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  listNewsletterSubscriptions,
  type NewsletterSubscription,
} from "@/lib/api/admin-ops";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";

export default function AdminNewsletterPage() {
  const [rows, setRows] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await listNewsletterSubscriptions(1);
        if (!c) setRows(asList(data));
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError
              ? e.message
              : "Could not load newsletter subscribers.",
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
        eyebrow="Content"
        title="Newsletter"
        description="Subscriber list from the content API."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No subscribers"
          description="Newsletter sign-ups will appear here."
        />
      ) : null}
      {rows.length > 0 ? (
        <DataTable headers={["Email", "Joined", "Active"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td className="font-mono text-xs text-petrol">{r.email}</Td>
              <Td className="font-mono text-xs text-ink-muted">
                {r.created_at
                  ? new Date(r.created_at).toLocaleString()
                  : "—"}
              </Td>
              <Td className="font-mono text-xs">
                {r.is_active === false ? "No" : "Yes"}
              </Td>
            </tr>
          ))}
        </DataTable>
      ) : null}
    </div>
  );
}
