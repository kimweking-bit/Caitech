"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getStudentDashboard } from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type { DashboardEnrollment } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function StudentLearningPage() {
  const [courses, setCourses] = useState<DashboardEnrollment[]>([]);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const dash = await getStudentDashboard(1);
        if (!c) setCourses(dash.my_courses || []);
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

  const active = courses.filter((e) => !e.completed);
  const completed = courses.filter((e) => e.completed);
  const list = tab === "active" ? active : completed;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="My learning"
        title="Programme library"
        description="Active and completed enrolments with real progress from the LMS."
      />
      <div className="flex gap-2 border-b border-line">
        {(
          [
            ["active", `Active (${active.length})`],
            ["completed", `Completed (${completed.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              "px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] " +
              (tab === id
                ? "border-b-2 border-petrol text-petrol"
                : "text-ink-muted")
            }
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && list.length === 0 ? (
        <EmptyState
          title={
            tab === "active"
              ? "No active programmes"
              : "No completed programmes yet"
          }
          description="Browse the public catalogue to enrol."
          action={
            <Button href="/courses" variant="lime">
              Browse courses
            </Button>
          }
        />
      ) : null}
      <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
        {list.map((e) => (
          <li key={e.id} className="flex flex-col border border-line bg-surface">
            <div className="aspect-[16/9] bg-petrol/5">
              {e.course_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.course_image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  CAITECH
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-display text-xl text-petrol">
                  {displayTitle(e.course_title)}
                </h2>
                <StatusBadge tone={e.completed ? "success" : "info"}>
                  {e.completed ? "Completed" : "In progress"}
                </StatusBadge>
              </div>
              <p className="font-mono text-[11px] text-ink-muted">
                {e.instructor_username
                  ? `Instructor · ${e.instructor_username}`
                  : "Instructor · —"}
                {e.course_duration ? ` · ${e.course_duration}` : ""}
              </p>
              <ProgressBar value={e.progress_percentage ?? 0} />
              <p className="font-mono text-[11px] text-ink-muted">
                {e.completed_lessons}/{e.total_lessons} lessons ·{" "}
                {Math.round(e.progress_percentage ?? 0)}%
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button href={`/student/learn/${e.course_slug}`} variant="lime">
                  {e.completed ? "Review" : "Continue"}
                </Button>
                <Button href={`/courses/${e.course_slug}`} variant="secondary">
                  Public page
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
