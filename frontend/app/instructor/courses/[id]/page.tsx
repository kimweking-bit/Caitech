"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getInstructorCourses, getInstructorStudents } from "@/lib/api/instructor";
import {
  asList,
  getCourseAssignments,
  getCourseQuizzes,
  getCourseSections,
  listSubmissions,
} from "@/lib/api/lms";
import { getCourseBySlug } from "@/lib/api/courses";
import { displayTitle } from "@/lib/utils/display";
import type {
  Assignment,
  AssignmentSubmission,
  CourseListItem,
  CourseSection,
  Quiz,
} from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { MetricCard, MetricGrid } from "@/components/portal/MetricGrid";
import { SectionCard } from "@/components/portal/SectionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function InstructorCourseWorkspacePage() {
  const params = useParams();
  const id = Number(params?.id);
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subs, setSubs] = useState<AssignmentSubmission[]>([]);
  const [students, setStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let c = false;
    (async () => {
      try {
        const mine = await getInstructorCourses(1);
        const assigned =
          (mine.results || []).find((x) => x.id === id) ||
          (
            await (async () => {
              for (let p = 2; p <= 4; p++) {
                const more = await getInstructorCourses(p);
                const hit = (more.results || []).find((x) => x.id === id);
                if (hit) return hit;
                if (!more.next) break;
              }
              return null;
            })()
          );
        if (!assigned) {
          throw new ApiError("This course is not in your teaching scope.", 403);
        }
        const [sec, asg, qz, st] = await Promise.all([
          getCourseSections(id).catch(() => []),
          getCourseAssignments(id).catch(() => []),
          getCourseQuizzes(id).catch(() => []),
          getInstructorStudents({ page: 1, course: id }).catch(
            () => ({ results: [], count: 0 }) as const,
          ),
        ]);
        if (assigned.slug) {
          await getCourseBySlug(assigned.slug).catch(() => null);
        }
        const aList = asList(asg);
        const pending: AssignmentSubmission[] = [];
        for (const a of aList.slice(0, 12)) {
          const s = await listSubmissions(a.id).catch(() => []);
          pending.push(...asList(s).filter((x) => x.grade == null));
        }
        if (!c) {
          setCourse(assigned);
          setSections(asList(sec));
          setAssignments(aList);
          setQuizzes(asList(qz));
          setSubs(pending);
          setStudents(
            "results" in st
              ? (st.results || []).filter((e) => e.course === id).length ||
                  st.results?.length ||
                  0
              : 0,
          );
        }
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load course workspace.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  const title =
    course && "title" in course ? displayTitle(course.title) : `Course #${id}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teaching workspace"
        title={title}
        description="Curriculum, assessments, and grading queue for this assigned programme only."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/instructor/grading" variant="lime">
              Grading queue
            </Button>
            <Button href="/instructor/courses" variant="secondary">
              All courses
            </Button>
          </div>
        }
      />

      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && course ? (
        <>
          <MetricGrid>
            <MetricCard label="Students" value={students} />
            <MetricCard label="Sections" value={sections.length} />
            <MetricCard label="Assignments" value={assignments.length} />
            <MetricCard label="Quizzes" value={quizzes.length} />
            <MetricCard label="Ungraded" value={subs.length} hint="Awaiting your grade" />
          </MetricGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Curriculum">
              {sections.length === 0 ? (
                <p className="text-sm text-ink-muted">No sections yet.</p>
              ) : (
                <ul className="list-none space-y-2 p-0 text-sm">
                  {sections.map((s) => (
                    <li key={s.id} className="border-b border-line py-2 last:border-0">
                      <span className="font-medium text-petrol">{s.title}</span>
                      <span className="ml-2 font-mono text-[10px] text-ink-muted">
                        order {s.order}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Needs grading">
              {subs.length === 0 ? (
                <p className="text-sm text-ink-muted">No ungraded submissions.</p>
              ) : (
                <ul className="list-none space-y-2 p-0 text-sm">
                  {subs.slice(0, 8).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 border-b border-line py-2 last:border-0"
                    >
                      <span>
                        #{s.id} · assignment {s.assignment}
                      </span>
                      <StatusBadge status="pending" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <Link
                  href="/instructor/grading"
                  className="text-sm text-petrol underline-offset-4 hover:underline"
                >
                  Open full grading queue →
                </Link>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Assignments">
            <ul className="list-none divide-y divide-line p-0 text-sm">
              {assignments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div>
                    <p className="font-medium text-petrol">{a.title}</p>
                    <p className="font-mono text-[10px] text-ink-muted">
                      due{" "}
                      {a.due_at ? new Date(a.due_at).toLocaleDateString() : "—"} · max{" "}
                      {a.max_points}
                    </p>
                  </div>
                </li>
              ))}
              {assignments.length === 0 ? (
                <li className="py-2 text-ink-muted">No assignments on this course.</li>
              ) : null}
            </ul>
          </SectionCard>

          <SectionCard title="Quizzes">
            <ul className="list-none divide-y divide-line p-0 text-sm">
              {quizzes.map((q) => (
                <li key={q.id} className="py-2">
                  <p className="font-medium text-petrol">{q.title}</p>
                  <p className="font-mono text-[10px] text-ink-muted">
                    max attempts {q.max_attempts ?? "—"}
                  </p>
                </li>
              ))}
              {quizzes.length === 0 ? (
                <li className="py-2 text-ink-muted">No quizzes on this course.</li>
              ) : null}
            </ul>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
