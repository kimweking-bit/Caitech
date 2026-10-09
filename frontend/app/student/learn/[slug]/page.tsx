"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  getCourseAssignments,
  getCourseQuizzes,
  getCourseSections,
  getEnrollmentProgress,
  getLesson,
  getSectionLessons,
  getStudentDashboard,
  markLessonProgress,
} from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type {
  Assignment,
  CourseLesson,
  CourseSection,
  EnrollmentProgress,
  Quiz,
} from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function StudentLearningRoomPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessonsBySection, setLessonsBySection] = useState<
    Record<number, CourseLesson[]>
  >({});
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const flatLessons = useMemo(() => {
    const rows: CourseLesson[] = [];
    for (const s of sections) rows.push(...(lessonsBySection[s.id] || []));
    return rows;
  }, [sections, lessonsBySection]);

  const refreshProgress = useCallback(async (enrId: number) => {
    setProgress(await getEnrollmentProgress(enrId));
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const dash = await getStudentDashboard(1);
        const enr = (dash.my_courses || []).find((x) => x.course_slug === slug);
        if (!enr) throw new Error("You are not enrolled in this programme.");
        if (c) return;
        setEnrollmentId(enr.id);
        setCourseTitle(enr.course_title);
        const secs = asList(await getCourseSections(enr.course_id)).sort(
          (a, b) => a.order - b.order,
        );
        setSections(secs);
        const map: Record<number, CourseLesson[]> = {};
        for (const s of secs) {
          map[s.id] = asList(await getSectionLessons(s.id)).sort(
            (a, b) => a.order - b.order,
          );
        }
        setLessonsBySection(map);
        const first = secs.flatMap((s) => map[s.id] || [])[0];
        if (first) setActiveLessonId(first.id);
        setAssignments(
          asList(await getCourseAssignments(enr.course_id).catch(() => [])),
        );
        setQuizzes(
          asList(await getCourseQuizzes(enr.course_id).catch(() => [])),
        );
        await refreshProgress(enr.id);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError || e instanceof Error
              ? e.message
              : "Could not open learning room.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [slug, refreshProgress]);

  useEffect(() => {
    let c = false;
    (async () => {
      if (!activeLessonId) {
        setLesson(null);
        return;
      }
      try {
        const L = await getLesson(activeLessonId);
        if (!c) setLesson(L);
      } catch (e) {
        if (!c)
          setMsg(e instanceof ApiError ? e.message : "Could not load lesson.");
      }
    })();
    return () => {
      c = true;
    };
  }, [activeLessonId]);

  async function onComplete() {
    if (!enrollmentId || !activeLessonId) return;
    setBusy(true);
    setMsg(null);
    try {
      await markLessonProgress(enrollmentId, activeLessonId, true);
      await refreshProgress(enrollmentId);
      setMsg("Lesson marked complete.");
    } catch (e) {
      setMsg(
        e instanceof ApiError ? e.message : "Could not update progress.",
      );
    } finally {
      setBusy(false);
    }
  }

  const idx = flatLessons.findIndex((l) => l.id === activeLessonId);
  const prev = idx > 0 ? flatLessons[idx - 1] : null;
  const next =
    idx >= 0 && idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null;

  const completedIds = new Set<number>();
  const lessonsProg = (progress as { lessons?: { lesson: number; completed: boolean }[] } | null)
    ?.lessons;
  if (Array.isArray(lessonsProg)) {
    for (const r of lessonsProg) if (r.completed) completedIds.add(r.lesson);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning room"
        title={displayTitle(courseTitle) || "Programme"}
        description="Curriculum, lesson content, and progress in one workspace."
        actions={
          <Button href="/student/learning" variant="secondary">
            Back to library
          </Button>
        }
      />
      {loading ? <LoadingBlock label="Opening learning room…" /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error ? (
        <>
          <div className="border border-line bg-surface p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Course progress
                </p>
                <p className="mt-1 font-display text-2xl text-petrol">
                  {Math.round(progress?.progress_percentage ?? 0)}%
                </p>
              </div>
              <p className="font-mono text-[11px] text-ink-muted">
                {progress?.completed_lessons ?? 0}/
                {progress?.total_lessons ?? 0} lessons
              </p>
            </div>
            <ProgressBar
              className="mt-3"
              value={progress?.progress_percentage ?? 0}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <aside className="border border-line bg-surface">
              <div className="border-b border-line px-3 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Curriculum
                </p>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-2">
                {sections.map((s, si) => (
                  <div key={s.id} className="mb-3">
                    <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                      {String(si + 1).padStart(2, "0")} · {s.title}
                    </p>
                    <ul className="list-none space-y-0.5 p-0">
                      {(lessonsBySection[s.id] || []).map((l) => {
                        const done = completedIds.has(l.id);
                        const active = l.id === activeLessonId;
                        return (
                          <li key={l.id}>
                            <button
                              type="button"
                              onClick={() => setActiveLessonId(l.id)}
                              className={cn(
                                "flex w-full items-start gap-2 px-2 py-2 text-left text-sm",
                                active
                                  ? "bg-petrol text-ground"
                                  : "text-petrol hover:bg-ground",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                                  done ? "bg-lime" : "bg-line",
                                )}
                              />
                              <span className="min-w-0 flex-1">{l.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                {assignments.length ? (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                      Assignments
                    </p>
                    <ul className="mt-1 list-none p-0">
                      {assignments.map((a) => (
                        <li key={a.id} className="px-2 py-1.5 text-sm text-petrol">
                          <Link
                            href="/student/assignments"
                            className="hover:underline"
                          >
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {quizzes.length ? (
                  <div className="mt-2 border-t border-line pt-3">
                    <p className="px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                      Quizzes
                    </p>
                    <ul className="mt-1 list-none p-0">
                      {quizzes.map((q) => (
                        <li key={q.id} className="px-2 py-1.5 text-sm text-petrol">
                          <Link
                            href="/student/quizzes"
                            className="hover:underline"
                          >
                            {q.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              {msg ? (
                <p className="text-sm text-ink-muted" role="status">
                  {msg}
                </p>
              ) : null}
              {lesson ? (
                <article className="border border-line bg-surface p-5 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      tone={
                        completedIds.has(lesson.id) ? "success" : "neutral"
                      }
                    >
                      {completedIds.has(lesson.id) ? "Completed" : "Lesson"}
                    </StatusBadge>
                    {lesson.is_preview ? (
                      <StatusBadge tone="info">Preview</StatusBadge>
                    ) : null}
                  </div>
                  <h2 className="mt-3 font-display text-3xl text-petrol">
                    {lesson.title}
                  </h2>
                  {lesson.video_url ? (
                    <div className="mt-6 aspect-video overflow-hidden border border-line bg-petrol/5">
                      <iframe
                        title={lesson.title}
                        src={lesson.video_url}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  {lesson.content ? (
                    <div className="mt-6 whitespace-pre-wrap text-sm text-ink">
                      {lesson.content}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-ink-muted">
                      No written content for this lesson.
                    </p>
                  )}
                  <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!prev || busy}
                      onClick={() => prev && setActiveLessonId(prev.id)}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="lime"
                      disabled={busy || completedIds.has(lesson.id)}
                      onClick={() => void onComplete()}
                    >
                      {busy
                        ? "Saving…"
                        : completedIds.has(lesson.id)
                          ? "Completed"
                          : "Mark complete"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!next || busy}
                      onClick={() => next && setActiveLessonId(next.id)}
                    >
                      Next
                    </Button>
                  </div>
                </article>
              ) : (
                <p className="text-sm text-ink-muted">
                  Select a lesson from the curriculum.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
