"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getInstructorCourses,
  getInstructorOverview,
  type InstructorOverview,
} from "@/lib/api/instructor";
import { displayTitle } from "@/lib/utils/display";
import type { CourseListItem } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { MetricCard, MetricGrid } from "@/components/portal/MetricGrid";
import { SectionCard } from "@/components/portal/SectionCard";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";

export default function InstructorAnalyticsPage() {
  const [overview, setOverview] = useState<InstructorOverview | null>(null);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [ov, page] = await Promise.all([
          getInstructorOverview(),
          getInstructorCourses(1),
        ]);
        if (c) return;
        setOverview(ov);
        setCourses(page.results || []);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load analytics.",
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
        eyebrow="Performance"
        title="Analytics"
        description="Real metrics derived from your assigned courses and enrolments — no fabricated charts."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {overview ? (
        <>
          <MetricGrid>
            <MetricCard label="Courses" value={overview.assigned_courses} />
            <MetricCard label="Students" value={overview.total_students} />
            <MetricCard
              label="Completion"
              value={`${overview.completion_rate}%`}
            />
            <MetricCard
              label="Avg rating"
              value={overview.average_rating ?? "—"}
              hint={`${overview.reviews_count} reviews`}
            />
          </MetricGrid>

          <SectionCard title="Completion across teaching load">
            <p className="mb-3 text-sm text-ink-muted">
              Share of enrolments marked complete on your programmes.
            </p>
            <ProgressBar value={overview.completion_rate} />
            <p className="mt-2 font-mono text-[11px] text-ink-muted">
              {overview.completed_enrollments} of {overview.total_enrollments}{" "}
              enrolments complete
            </p>
          </SectionCard>

          <SectionCard title="Programme engagement signals">
            {courses.length === 0 ? (
              <EmptyState title="No courses" description="Nothing to chart." />
            ) : (
              <ul className="list-none divide-y divide-line p-0">
                {courses.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-display text-lg text-petrol">
                        {displayTitle(c.title)}
                      </p>
                      <p className="font-mono text-[11px] text-ink-muted">
                        {c.enrolled_count ?? 0} enrolled ·{" "}
                        {c.review_count ?? 0} reviews
                      </p>
                    </div>
                    <p className="font-mono text-sm text-petrol">
                      {c.average_rating != null
                        ? `★ ${c.average_rating}`
                        : "No rating"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
