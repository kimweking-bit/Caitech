"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getInstructorCourses } from "@/lib/api/instructor";
import {
  asList,
  getCourseAssignments,
  getCourseQuizzes,
  getCourseSections,
  getSectionLessons,
  listCourseReviews,
} from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type {
  Assignment,
  CourseLesson,
  CourseListItem,
  CourseReview,
  CourseSection,
  Quiz,
} from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { Button } from "@/components/ui/Button";

export default function InstructorCourseWorkspacePage() {
  const params = useParams();
  const id = Number(params?.id);
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      if (!Number.isFinite(id)) {
        setError("Invalid course.");
        setLoading(false);
        return;
      }
      try {
        const page = await getInstructorCourses(1);
        const found = (page.results || []).find((x) => x.id === id) || null;
        if (!found) throw new Error("Course not assigned to you.");
        if (c) return;
        setCourse(found);
        const secs = asList(await getCourseSections(id)).sort(
          (a, b) => a.order - b.order,
        );
        setSections(secs);
        const all: CourseLesson[] = [];
        for (const s of secs)
          all.push(...asList(await getSectionLessons(s.id)));
        setLessons(all.sort((a, b) => a.order - b.order));
        setAssignments(asList(await getCourseAssignments(id).catch(() => [])));
        setQuizzes(asList(await getCourseQuizzes(id).catch(() => [])));
        setReviews(
          asList(
            await listCourseReviews(found.slug).catch(() => []),
          ),
        );
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError || e instanceof Error
              ? e.message
              : "Could not load course workspace.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Course workspace"
        title={course ? displayTitle(course.title) : "Course"}
        description="Curriculum, assessments, and reviews for this assigned programme."
        actions={
          <>
            <Button href="/instructor/courses" variant="secondary">
              All courses
            </Button>
            <Button href="/instructor/grading" variant="lime">
              Grade work
            </Button>
          </>
        }
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {course ? (
        <>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={course.is_published ? "success" : "neutral"}>
              {course.is_published ? "Published" : "Unpublished"}
            </StatusBadge>
            <StatusBadge tone="info">
              {course.enrolled_count ?? 0} enrolled
            </StatusBadge>
            <StatusBadge tone="neutral">
              {sections.length} modules · {lessons.length} lessons
            </StatusBadge>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Curriculum">
              <ol className="list-none space-y-3 p-0">
                {sections.map((s, i) => (
                  <li key={s.id} className="border border-line p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                      Module {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm text-petrol">{s.title}</p>
                    <ul className="mt-2 list-none space-y-1 p-0">
                      {lessons
                        .filter((l) => l.section === s.id)
                        .map((l) => (
                          <li
                            key={l.id}
                            className="font-mono text-[11px] text-ink-muted"
                          >
                            {l.title}
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
                {sections.length === 0 ? (
                  <li className="text-sm text-ink-muted">No modules yet.</li>
                ) : null}
              </ol>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Assignments">
                <ul className="list-none space-y-2 p-0">
                  {assignments.map((a) => (
                    <li key={a.id} className="border-b border-line pb-2 text-sm">
                      <Link
                        href="/instructor/grading"
                        className="text-petrol hover:underline"
                      >
                        {a.title}
                      </Link>
                      {a.due_at ? (
                        <p className="font-mono text-[11px] text-ink-muted">
                          Due {new Date(a.due_at).toLocaleString()}
                        </p>
                      ) : null}
                    </li>
                  ))}
                  {assignments.length === 0 ? (
                    <li className="text-sm text-ink-muted">No assignments.</li>
                  ) : null}
                </ul>
              </SectionCard>
              <SectionCard title="Quizzes">
                <ul className="list-none space-y-2 p-0">
                  {quizzes.map((q) => (
                    <li key={q.id} className="text-sm text-petrol">
                      {q.title}
                    </li>
                  ))}
                  {quizzes.length === 0 ? (
                    <li className="text-sm text-ink-muted">No quizzes.</li>
                  ) : null}
                </ul>
              </SectionCard>
              <SectionCard title="Recent reviews">
                <ul className="list-none space-y-3 p-0">
                  {reviews.slice(0, 5).map((r) => (
                    <li key={r.id} className="border-b border-line pb-2">
                      <p className="font-mono text-[11px] text-ink-muted">
                        {r.student_username} · {r.rating}/5
                      </p>
                      <p className="mt-1 text-sm text-ink">{r.comment}</p>
                    </li>
                  ))}
                  {reviews.length === 0 ? (
                    <li className="text-sm text-ink-muted">No reviews yet.</li>
                  ) : null}
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
