"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listAdminEnrollments } from "@/lib/api/lms";
import type { AdminEnrollment } from "@/types/api";
import { displayTitle } from "@/lib/utils/display";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";

export default function AdminEnrollmentsPage() {
  const [rows, setRows] = useState<AdminEnrollment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const all: AdminEnrollment[] = [];
        let total = 0;
        for (let p = 1; p <= 10; p++) {
          const data = await listAdminEnrollments(p);
          const batch = asList(data);
          all.push(...batch);
          if (typeof data === "object" && data && "count" in data) {
            total = Number((data as { count: number }).count) || total;
          }
          if (
            Array.isArray(data) ||
            !(data as { next?: string | null }).next ||
            batch.length === 0
          )
            break;
        }
        if (!c) {
          setRows(all);
          setCount(total || all.length);
        }
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load enrolments.",
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
        eyebrow="Operations"
        title="Enrolments"
        description="Institution-wide enrolments from the admin LMS API."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No enrolments"
          description="Enrolments appear after purchases or manual enrolment."
        />
      ) : null}
      {rows.length > 0 ? (
        <>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Showing {rows.length}
            {count ? ` · total ${count}` : ""}
          </p>
          <DataTable
            headers={["Student", "Course", "Enrolled", "Status"]}
          >
            {rows.map((r) => (
              <tr key={r.id}>
                <Td>
                  <p className="text-sm text-petrol">
                    {r.student_username || String(r.student)}
                  </p>
                </Td>
                <Td>{displayTitle(r.course_title || String(r.course))}</Td>
                <Td className="font-mono text-xs text-ink-muted">
                  {r.enrolled_at
                    ? new Date(r.enrolled_at).toLocaleDateString()
                    : "—"}
                </Td>
                <Td>
                  <StatusBadge tone={r.completed ? "success" : "info"}>
                    {r.completed ? "Completed" : "Active"}
                  </StatusBadge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </>
      ) : null}
    </div>
  );
}
