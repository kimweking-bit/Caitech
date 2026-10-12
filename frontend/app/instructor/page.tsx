"use client";

import Link from "next/link";
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
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function InstructorDashboardPage() {
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
            e instanceof ApiError ? e.message : "Could not load workspace.",
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
        eyebrow="Teaching workspace"
        title="Your classroom pulse"
        description="Teaching workspace — assigned programmes, student performance, and grading queue. Not institutional admin."
        actions={
          <Button href="/instructor/grading" variant="lime">
            Open grading queue
          </Button>
        }
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
            <MetricCard
              label="Assigned courses"
              value={overview.assigned_courses}
            />
            <MetricCard
              label="Students"
              value={overview.total_students}
              hint={`${overview.total_enrollments} enrolments`}
            />
            <MetricCard
              label="Completion rate"
              value={`${overview.completion_rate}%`}
              hint={`${overview.completed_enrollments} completed`}
            />
            <MetricCard
              label="Pending submissions"
              value={overview.pending_submissions}
              hint="Awaiting grade"
            />
          </MetricGrid>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Requires attention"
              action={
                <Link
                  href="/instructor/grading"
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-petrol hover:underline"
                >
                  Grade
                </Link>
              }
            >
              {overview.pending_submissions > 0 ? (
                <p className="text-sm text-ink">
                  {overview.pending_submissions} submission
                  {overview.pending_submissions === 1 ? "" : "s"} waiting for a
                  grade across your assigned programmes.
                </p>
              ) : (
                <p className="text-sm text-ink-muted">
                  No ungraded submissions right now.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button href="/instructor/students" variant="secondary">
                  Students
                </Button>
                <Button href="/instructor/courses" variant="secondary">
                  Courses
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Teaching snapshot">
              <ul className="list-none space-y-3 p-0 text-sm">
                <li className="flex justify-between border-b border-line pb-2">
                  <span className="text-ink-muted">Lessons in curriculum</span>
                  <span className="font-mono text-petrol">
                    {overview.total_lessons}
                  </span>
                </li>
                <li className="flex justify-between border-b border-line pb-2">
                  <span className="text-ink-muted">Reviews</span>
                  <span className="font-mono text-petrol">
                    {overview.reviews_count}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-ink-muted">Average rating</span>
                  <span className="font-mono text-petrol">
                    {overview.average_rating ?? "—"}
                  </span>
                </li>
              </ul>
            </SectionCard>
          </div>

          <SectionCard
            title="Assigned programmes"
            action={
              <Link
                href="/instructor/courses"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-petrol hover:underline"
              >
                View all
              </Link>
            }
          >
            {courses.length === 0 ? (
              <EmptyState
                title="No assigned courses"
                description="When an admin assigns programmes to you, they appear here."
              />
            ) : (
              <ul className="list-none divide-y divide-line p-0">
                {courses.slice(0, 6).map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-display text-lg text-petrol">
                        {displayTitle(c.title)}
                      </p>
                      <p className="font-mono text-[11px] text-ink-muted">
                        {c.is_published ? "Published" : "Draft"} · {c.slug}
                      </p>
                    </div>
                    <Button
                      href={`/instructor/courses/${c.id}`}
                      variant="secondary"
                    >
                      Manage
                    </Button>
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
