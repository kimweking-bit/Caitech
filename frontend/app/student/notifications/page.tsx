"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listMyNotifications } from "@/lib/api/admin-ops";
import type { NotificationEvent } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { StatusBadge } from "@/components/portal/StatusBadge";

function labelFor(n: NotificationEvent) {
  if (n.title) return n.title;
  const t = (n.type || "").toLowerCase();
  if (t.includes("enrol")) return "Enrolment update";
  if (t.includes("regist")) return "Registration";
  return n.type || "Notification";
}

export default function StudentNotificationsPage() {
  const [rows, setRows] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await listMyNotifications(1);
        if (!c) setRows(asList(data));
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load notifications.",
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning"
        title="Notifications"
        description="Account notices for your enrolments and learning activity."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Enrolment confirmations and system notices will appear here."
        />
      ) : null}
      <ul className="list-none space-y-2 p-0">
        {rows.map((n) => (
          <li key={n.id} className="border border-line bg-surface px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-petrol">{labelFor(n)}</p>
                {n.body || n.error ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    {n.body || n.error}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink-muted">
                    Delivered to {n.recipient}
                  </p>
                )}
              </div>
              <div className="text-right">
                <StatusBadge status={n.status || n.type || "info"} />
                <p className="mt-1 font-mono text-[10px] text-ink-muted">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
