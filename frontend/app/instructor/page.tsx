"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  getCourseAssignments,
  getCourseSections,
  getSectionLessons,
  gradeSubmission,
  listSubmissions,
} from "@/lib/api/lms";
import { getInstructorCourses } from "@/lib/api/instructor";
import { displayTitle } from "@/lib/utils/display";
import type {
  Assignment,
  AssignmentSubmission,
  CourseListItem,
  CourseLesson,
  CourseSection,
} from "@/types/api";

function InstructorHome() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [selected, setSelected] = useState<CourseListItem | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subs, setSubs] = useState<AssignmentSubmission[]>([]);
  const [activeAsg, setActiveAsg] = useState<Assignment | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function openCourse(course: CourseListItem) {
    setSelected(course);
    setMsg(null);
    setBusy(true);
    try {
      const secs = asList(await getCourseSections(course.id)).sort(
        (a, b) => a.order - b.order,
      );
      setSections(secs);
      const allLessons: CourseLesson[] = [];
      for (const s of secs)
        allLessons.push(...asList(await getSectionLessons(s.id)));
      setLessons(allLessons.sort((a, b) => a.order - b.order));
      setAssignments(
        asList(await getCourseAssignments(course.id).catch(() => [])),
      );
      setActiveAsg(null);
      setSubs([]);
    } catch (e) {
      setMsg(
        e instanceof ApiError ? e.message : "Could not load course content.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function openSubs(a: Assignment) {
    setActiveAsg(a);
    setBusy(true);
    setMsg(null);
    try {
      setSubs(asList(await listSubmissions(a.id)));
    } catch (e) {
      setMsg(
        e instanceof ApiError ? e.message : "Could not load submissions.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onGrade(subId: number) {
    setBusy(true);
    setMsg(null);
    try {
      await gradeSubmission(subId, grade, feedback);
      setMsg("Grade saved.");
      if (activeAsg) await openSubs(activeAsg);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not save grade.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Instructor
      </p>
      <h1 className="mt-3 font-display text-3xl text-petrol">
        Assigned programmes
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Review structure and grade submissions. Backend permissions apply.
      </p>
      {loading ? (
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Loading...
        </p>
      ) : null}
      {error ? (
        <p className="mt-8 text-sm text-petrol" role="alert">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="mt-4 text-sm text-ink-muted" role="status">
          {msg}
        </p>
      ) : null}
      <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <ul className="list-none space-y-1 border border-line p-0">
          {courses.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => void openCourse(c)}
                className={
                  "w-full px-3 py-3 text-left text-sm " +
                  (selected?.id === c.id
                    ? "bg-petrol text-ground"
                    : "text-petrol hover:bg-surface")
                }
              >
                {displayTitle(c.title)}
              </button>
            </li>
          ))}
          {!loading && courses.length === 0 ? (
            <li className="p-4 text-sm text-ink-muted">No courses visible.</li>
          ) : null}
        </ul>
        <div>
          {!selected ? (
            <p className="text-sm text-ink-muted">
              Select an assigned programme.
            </p>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-petrol">
                    {displayTitle(selected.title)}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {sections.length} modules · {lessons.length} lessons ·{" "}
                    {assignments.length} assignments
                  </p>
                </div>
                <Button href={`/courses/${selected.slug}`} variant="secondary">
                  Public page
                </Button>
              </div>
              <section>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Programme structure
                </h3>
                <ol className="mt-3 list-none space-y-3 p-0">
                  {sections.map((s, i) => (
                    <li key={s.id} className="border border-line p-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                        {String(i + 1).padStart(2, "0")}
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
                </ol>
              </section>
              <section>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Assignments
                </h3>
                <ul className="mt-3 list-none space-y-1 p-0">
                  {assignments.map((asg) => (
                    <li key={asg.id}>
                      <button
                        type="button"
                        className={
                          "w-full px-2 py-2 text-left text-sm " +
                          (activeAsg?.id === asg.id
                            ? "bg-petrol text-ground"
                            : "text-petrol hover:bg-surface")
                        }
                        onClick={() => void openSubs(asg)}
                      >
                        {asg.title}
                      </button>
                    </li>
                  ))}
                  {assignments.length === 0 ? (
                    <li className="text-sm text-ink-muted">No assignments.</li>
                  ) : null}
                </ul>
                {activeAsg ? (
                  <div className="mt-6 space-y-4">
                    <p className="font-display text-xl text-petrol">
                      {activeAsg.title} · submissions
                    </p>
                    {subs.length === 0 ? (
                      <p className="text-sm text-ink-muted">
                        No submissions yet.
                      </p>
                    ) : null}
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="space-y-3 border border-line p-4"
                      >
                        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                          {sub.student_username} ·{" "}
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleString()
                            : "draft"}
                        </p>
                        <p className="whitespace-pre-line text-sm text-ink">
                          {sub.content}
                        </p>
                        {sub.grade != null ? (
                          <p className="text-sm text-petrol">
                            Grade {sub.grade}
                            {sub.feedback ? " — " + sub.feedback : ""}
                          </p>
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            id={"g" + sub.id}
                            label="Grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            disabled={busy}
                          />
                          <Textarea
                            id={"f" + sub.id}
                            label="Feedback"
                            rows={2}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={busy}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="lime"
                          disabled={busy}
                          onClick={() => void onGrade(sub.id)}
                        >
                          {busy ? "Saving..." : "Save grade"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default function InstructorPage() {
  return (
    <RequireRole role="instructor">
      <InstructorHome />
    </RequireRole>
  );
}
