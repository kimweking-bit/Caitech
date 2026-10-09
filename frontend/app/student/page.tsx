"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getStudentDashboard } from "@/lib/api/lms";
import { listOrders } from "@/lib/api/payments";
import { displayTitle } from "@/lib/utils/display";
import type { DashboardEnrollment, StudentDashboard } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { MetricCard, MetricGrid } from "@/components/portal/MetricGrid";
import { SectionCard } from "@/components/portal/SectionCard";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

function courseStatus(e: DashboardEnrollment) {
  if (e.completed) return { label: "Completed", tone: "success" as const };
  if ((e.progress_percentage ?? 0) > 0)
    return { label: "In progress", tone: "info" as const };
  return { label: "Not started", tone: "neutral" as const };
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [dash, orders] = await Promise.all([
          getStudentDashboard(1),
          listOrders().catch(() => null),
        ]);
        if (c) return;
        setData(dash);
        setOrderCount(Array.isArray(orders) ? orders.length : null);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load dashboard.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const courses = data?.my_courses ?? [];
  const active = courses.filter((e) => !e.completed);
  const completed = courses.filter((e) => e.completed);
  const avgProgress =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((s, e) => s + (e.progress_percentage ?? 0), 0) /
            courses.length,
        );
  const continueCourse =
    active.find((e) => (e.progress_percentage ?? 0) > 0) || active[0] || null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student portal"
        title="Your learning"
        description="Continue where you left off, track progress, and keep assignments on schedule."
        actions={
          <Button href="/courses" variant="secondary">
            Browse programmes
          </Button>
        }
      />

      {loading ? <LoadingBlock label="Loading your dashboard…" /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && data ? (
        <>
          <MetricGrid>
            <MetricCard label="Active courses" value={active.length} />
            <MetricCard
              label="Overall progress"
              value={`${avgProgress}%`}
              hint="Average across enrollments"
            />
            <MetricCard label="Completed" value={completed.length} />
            <MetricCard
              label="Orders"
              value={orderCount ?? "—"}
              hint="Payment history"
            />
          </MetricGrid>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <SectionCard
              title="Continue learning"
              action={
                <Link
                  href="/student/learning"
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-petrol hover:underline"
                >
                  All courses
                </Link>
              }
            >
              {continueCourse ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-display text-2xl text-petrol">
                      {displayTitle(continueCourse.course_title)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                      {continueCourse.progress_percentage ?? 0}% complete
                    </p>
                    <ProgressBar
                      className="mt-3"
                      value={continueCourse.progress_percentage ?? 0}
                    />
                  </div>
                  <Button
                    href={`/student/learn/${continueCourse.course_slug}`}
                    variant="lime"
                  >
                    Resume learning room
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="No active programmes"
                  description="Enroll in a CAITECH programme to start learning."
                  action={
                    <Button href="/courses" variant="lime">
                      Explore catalogue
                    </Button>
                  }
                />
              )}
            </SectionCard>

            <SectionCard title="Snapshot">
              <ul className="list-none space-y-3 p-0 text-sm">
                <li className="flex justify-between gap-3 border-b border-line pb-2">
                  <span className="text-ink-muted">Enrollments</span>
                  <span className="font-mono text-petrol">{courses.length}</span>
                </li>
                <li className="flex justify-between gap-3 border-b border-line pb-2">
                  <span className="text-ink-muted">In progress</span>
                  <span className="font-mono text-petrol">{active.length}</span>
                </li>
                <li className="flex justify-between gap-3 border-b border-line pb-2">
                  <span className="text-ink-muted">Completed</span>
                  <span className="font-mono text-petrol">
                    {completed.length}
                  </span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-ink-muted">Portal</span>
                  <span className="font-mono text-petrol">Student</span>
                </li>
              </ul>
            </SectionCard>
          </div>

          <SectionCard title="Active programmes">
            {active.length === 0 ? (
              <EmptyState
                title="Nothing in progress"
                description="Completed courses move here once you enroll again or start a new programme."
              />
            ) : (
              <ul className="list-none divide-y divide-line p-0">
                {active.map((e) => {
                  const st = courseStatus(e);
                  return (
                    <li
                      key={e.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-lg text-petrol">
                            {displayTitle(e.course_title)}
                          </p>
                          <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                        </div>
                        <ProgressBar
                          className="mt-3 max-w-md"
                          value={e.progress_percentage ?? 0}
                        />
                        <p className="mt-1 font-mono text-[11px] text-ink-muted">
                          {e.progress_percentage ?? 0}% · enrolled{" "}
                          {new Date(e.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        href={`/student/learn/${e.course_slug}`}
                        variant="secondary"
                      >
                        Open
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
