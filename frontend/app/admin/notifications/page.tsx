"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listAdminNotifications } from "@/lib/api/admin-ops";
import type { NotificationEvent } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { StatusBadge } from "@/components/portal/StatusBadge";

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await listAdminNotifications(1);
        if (!c) setRows(asList(data));
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError
              ? e.message
              : "Could not load notifications.",
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
        eyebrow="System"
        title="Notifications"
        description="Admin notification log from the accounts API."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="System and staff notification events will list here."
        />
      ) : null}
      <ul className="list-none space-y-2 p-0">
        {rows.map((n) => (
          <li
            key={n.id}
            className="flex flex-col gap-1 border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm text-petrol">{n.type || "Notification"}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {n.recipient || "—"}
                {n.error ? ` · ${n.error}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {n.status ? (
                <StatusBadge tone="info">{n.status}</StatusBadge>
              ) : null}
              <span className="font-mono text-[11px] text-ink-muted">
                {n.created_at
                  ? new Date(n.created_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
