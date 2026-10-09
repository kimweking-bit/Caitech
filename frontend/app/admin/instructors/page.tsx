"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  listAdminInstructors,
  listInstructorApplications,
  reviewInstructorApplication,
  type InstructorApplication,
} from "@/lib/api/admin-ops";
import type { AdminUser } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<AdminUser[]>([]);
  const [apps, setApps] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [ins, applications] = await Promise.all([
      listAdminInstructors(1),
      listInstructorApplications(1),
    ]);
    setInstructors(asList(ins));
    setApps(asList(applications));
  }

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load instructors.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  async function onReview(id: number, approved: boolean) {
    setBusyId(id);
    setMsg(null);
    try {
      await reviewInstructorApplication(id, approved);
      setMsg(approved ? "Application approved." : "Application rejected.");
      await load();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Review failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People"
        title="Instructors"
        description="Approved instructors and pending teaching applications."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="text-sm text-ink-muted" role="status">
          {msg}
        </p>
      ) : null}

      <SectionCard title="Applications queue">
        {apps.length === 0 ? (
          <EmptyState
            title="No applications"
            description="Instructor applications will appear here for review."
          />
        ) : (
          <ul className="list-none space-y-3 p-0">
            {apps.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-3 border border-line p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="font-display text-lg text-petrol">
                    {a.username || a.email || `Application #${a.id}`}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ink-muted">
                    {a.email || "—"} · {a.status}
                    {a.created_at
                      ? ` · ${new Date(a.created_at).toLocaleString()}`
                      : ""}
                  </p>
                  <p className="mt-2 text-sm text-ink">
                    {String(a.message || a.motivation || "—")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="warning">{a.status}</StatusBadge>
                  <Button
                    type="button"
                    variant="lime"
                    disabled={busyId === a.id}
                    onClick={() => void onReview(a.id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busyId === a.id}
                    onClick={() => void onReview(a.id, false)}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Approved instructors">
        {instructors.length === 0 ? (
          <EmptyState
            title="No instructors"
            description="Approved instructor accounts will list here."
          />
        ) : (
          <DataTable headers={["Instructor", "Email", "Flags"]}>
            {instructors.map((u) => (
              <tr key={u.id}>
                <Td>
                  <p className="text-sm text-petrol">{u.username}</p>
                </Td>
                <Td className="font-mono text-xs">{u.email}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {u.is_verified_instructor ? (
                      <StatusBadge tone="success">Verified</StatusBadge>
                    ) : (
                      <StatusBadge tone="info">Instructor</StatusBadge>
                    )}
                    {u.is_staff ? (
                      <StatusBadge tone="warning">Staff</StatusBadge>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </SectionCard>
    </div>
  );
}
