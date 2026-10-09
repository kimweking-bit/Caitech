"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getInstructorCourses } from "@/lib/api/instructor";
import { displayTitle } from "@/lib/utils/display";
import type { CourseListItem } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const page = await getInstructorCourses(1);
        if (!c) setCourses(page.results || []);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load courses.",
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
        eyebrow="Teaching"
        title="My courses"
        description="Programmes assigned to you — not the public catalogue."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && courses.length === 0 ? (
        <EmptyState
          title="No assigned courses"
          description="Ask an administrator to assign programmes to your instructor account."
        />
      ) : null}
      {courses.length > 0 ? (
        <DataTable
          headers={["Programme", "Status", "Level", "Rating", "Actions"]}
        >
          {courses.map((c) => (
            <tr key={c.id}>
              <Td>
                <p className="font-display text-base text-petrol">
                  {displayTitle(c.title)}
                </p>
                <p className="font-mono text-[11px] text-ink-muted">{c.slug}</p>
              </Td>
              <Td>
                <StatusBadge tone={c.is_published ? "success" : "neutral"}>
                  {c.is_published ? "Published" : "Unpublished"}
                </StatusBadge>
              </Td>
              <Td className="font-mono text-xs">{c.level || "—"}</Td>
              <Td className="font-mono text-xs">
                {c.average_rating != null
                  ? `${c.average_rating} (${c.review_count ?? 0})`
                  : "—"}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Button href={`/instructor/courses/${c.id}`} variant="lime">
                    Workspace
                  </Button>
                  <Button href={`/courses/${c.slug}`} variant="secondary">
                    Public
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      ) : null}
    </div>
  );
}
