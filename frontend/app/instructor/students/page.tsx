"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getInstructorStudents } from "@/lib/api/instructor";
import { displayTitle } from "@/lib/utils/display";
import type { AdminEnrollment } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function InstructorStudentsPage() {
  const [rows, setRows] = useState<AdminEnrollment[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        const page = await getInstructorStudents(1, q);
        if (!c) {
          setRows(page.results || []);
          setCount(page.count ?? page.results?.length ?? 0);
        }
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load students.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [q]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setQ(search.trim());
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cohort"
        title="Students"
        description="Learners enrolled in programmes assigned to you."
      />
      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1">
          <Input
            id="student-search"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, course…"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Enrolled learners on your courses will list here."
        />
      ) : null}
      {rows.length > 0 ? (
        <>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            {count} enrolment{count === 1 ? "" : "s"}
          </p>
          <DataTable
            headers={[
              "Student",
              "Course",
              "Enrolled",
              "Progress",
              "Status",
            ]}
          >
            {rows.map((r) => (
              <tr key={r.id}>
                <Td>
                  <p className="text-sm text-petrol">
                    {r.student_username || String(r.student)}
                  </p>
                  <p className="font-mono text-[11px] text-ink-muted">
                    ID {r.student}
                  </p>
                </Td>
                <Td>{displayTitle(r.course_title || String(r.course))}</Td>
                <Td className="font-mono text-xs text-ink-muted">
                  {r.enrolled_at
                    ? new Date(r.enrolled_at).toLocaleDateString()
                    : "—"}
                </Td>
                <Td className="font-mono text-xs text-ink-muted">—</Td>
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
