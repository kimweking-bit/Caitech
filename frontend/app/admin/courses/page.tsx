"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCourses } from "@/lib/api/courses";
import { displayTitle } from "@/lib/utils/display";
import type { CourseListItem } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const page = await getCourses({ page: 1 });
        if (!c) {
          setCourses(page.results || []);
          setCount(page.count ?? page.results?.length ?? 0);
        }
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
        eyebrow="Catalogue"
        title="Courses"
        description="Published and draft programmes from the courses API. Deep curriculum editing remains in Django admin when needed."
        actions={
          <Button href="/courses" variant="secondary">
            Public catalogue
          </Button>
        }
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && courses.length === 0 ? (
        <EmptyState
          title="No courses"
          description="Create programmes in Django admin or via the courses API."
        />
      ) : null}
      {courses.length > 0 ? (
        <>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            {count} programme{count === 1 ? "" : "s"}
          </p>
          <DataTable
            headers={["Programme", "Status", "Level", "Price", "Actions"]}
          >
            {courses.map((c) => (
              <tr key={c.id}>
                <Td>
                  <p className="font-display text-base text-petrol">
                    {displayTitle(c.title)}
                  </p>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {c.slug}
                  </p>
                </Td>
                <Td>
                  <StatusBadge tone={c.is_published ? "success" : "neutral"}>
                    {c.is_published ? "Published" : "Draft"}
                  </StatusBadge>
                </Td>
                <Td className="font-mono text-xs">{c.level || "—"}</Td>
                <Td className="font-mono text-xs">
                  {c.currency || "KES"} {c.price ?? "—"}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    <Button href={`/courses/${c.slug}`} variant="secondary">
                      View
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </DataTable>
        </>
      ) : null}
    </div>
  );
}
