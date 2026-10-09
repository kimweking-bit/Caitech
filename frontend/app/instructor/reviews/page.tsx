"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getInstructorCourses } from "@/lib/api/instructor";
import { asList, listCourseReviews } from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type { CourseListItem, CourseReview } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { StatusBadge } from "@/components/portal/StatusBadge";

type Row = { course: CourseListItem; review: CourseReview };

export default function InstructorReviewsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const page = await getInstructorCourses(1);
        const out: Row[] = [];
        for (const course of page.results || []) {
          const reviews = asList(
            await listCourseReviews(course.slug).catch(() => []),
          );
          for (const review of reviews) out.push({ course, review });
        }
        out.sort(
          (a, b) =>
            Date.parse(b.review.created_at) - Date.parse(a.review.created_at),
        );
        if (!c) setRows(out);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load reviews.",
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
        eyebrow="Feedback"
        title="Course reviews"
        description="Ratings left by learners on your assigned programmes."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="When students review your courses, feedback appears here."
        />
      ) : null}
      <ul className="list-none space-y-3 p-0">
        {rows.map(({ course, review }) => (
          <li
            key={review.id}
            className="border border-line bg-surface px-4 py-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg text-petrol">
                {displayTitle(course.title)}
              </p>
              <StatusBadge tone="info">{review.rating}/5</StatusBadge>
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              {review.student_username} ·{" "}
              {new Date(review.created_at).toLocaleString()}
            </p>
            <p className="mt-3 text-sm text-ink">{review.comment || "—"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
