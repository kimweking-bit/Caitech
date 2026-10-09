"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getInstructorCourses } from "@/lib/api/instructor";
import {
  asList,
  getCourseAssignments,
  gradeSubmission,
  listSubmissions,
} from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type {
  Assignment,
  AssignmentSubmission,
  CourseListItem,
} from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type QueueItem = {
  course: CourseListItem;
  assignment: Assignment;
  submission: AssignmentSubmission;
};

export default function InstructorGradingPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [active, setActive] = useState<QueueItem | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  async function load() {
    const page = await getInstructorCourses(1);
    const courses = page.results || [];
    const items: QueueItem[] = [];
    for (const course of courses) {
      const assignments = asList(
        await getCourseAssignments(course.id).catch(() => []),
      );
      for (const assignment of assignments) {
        const submissions = asList(
          await listSubmissions(assignment.id).catch(() => []),
        );
        for (const submission of submissions) {
          if (!submission.content && !submission.submitted_at) continue;
          items.push({ course, assignment, submission });
        }
      }
    }
    items.sort((a, b) => {
      const ta = a.submission.submitted_at
        ? Date.parse(a.submission.submitted_at)
        : 0;
      const tb = b.submission.submitted_at
        ? Date.parse(b.submission.submitted_at)
        : 0;
      return tb - ta;
    });
    setQueue(items);
  }

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load submissions.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const visible = queue.filter((q) =>
    filter === "pending" ? q.submission.grade == null : true,
  );

  async function onGrade() {
    if (!active) return;
    setBusy(true);
    setMsg(null);
    try {
      await gradeSubmission(active.submission.id, grade, feedback);
      setMsg("Grade saved.");
      await load();
      setActive(null);
      setGrade("");
      setFeedback("");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not save grade.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workflow"
        title="Grading"
        description="Review student submissions and return grades with feedback."
      />
      <div className="flex gap-2 border-b border-line">
        {(
          [
            ["pending", "Pending"],
            ["all", "All submissions"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={
              "px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] " +
              (filter === id
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
      {!loading && !error && visible.length === 0 ? (
        <EmptyState
          title={
            filter === "pending"
              ? "No pending submissions"
              : "No submissions yet"
          }
          description="When learners submit assignments on your courses, they appear here."
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <ul className="list-none space-y-2 p-0">
          {visible.map((item) => {
            const key = `${item.assignment.id}-${item.submission.id}`;
            const selected =
              active?.submission.id === item.submission.id &&
              active.assignment.id === item.assignment.id;
            const graded = item.submission.grade != null;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(item);
                    setGrade(
                      item.submission.grade != null
                        ? String(item.submission.grade)
                        : "",
                    );
                    setFeedback(item.submission.feedback || "");
                    setMsg(null);
                  }}
                  className={
                    "w-full border border-line px-4 py-3 text-left " +
                    (selected ? "bg-petrol text-ground" : "bg-surface")
                  }
                >
                  <p className="font-display text-lg">
                    {item.assignment.title}
                  </p>
                  <p
                    className={
                      "mt-1 font-mono text-[11px] uppercase tracking-[0.12em] " +
                      (selected ? "text-ground/70" : "text-ink-muted")
                    }
                  >
                    {displayTitle(item.course.title)} ·{" "}
                    {item.submission.student_username}
                  </p>
                  <div className="mt-2">
                    <StatusBadge tone={graded ? "success" : "warning"}>
                      {graded ? "Graded" : "Pending"}
                    </StatusBadge>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div>
          {!active ? (
            <p className="text-sm text-ink-muted">
              Select a submission to grade.
            </p>
          ) : (
            <SectionCard title="Submission">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                {active.submission.student_username} ·{" "}
                {active.submission.submitted_at
                  ? new Date(active.submission.submitted_at).toLocaleString()
                  : "no timestamp"}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink">
                {active.submission.content || "—"}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  id="grade"
                  label="Grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={busy}
                />
                <Textarea
                  id="feedback"
                  label="Feedback"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={busy}
                />
              </div>
              {msg ? (
                <p className="mt-3 text-sm text-ink-muted" role="status">
                  {msg}
                </p>
              ) : null}
              <div className="mt-4">
                <Button
                  type="button"
                  variant="lime"
                  disabled={busy}
                  onClick={() => void onGrade()}
                >
                  {busy ? "Saving…" : "Submit grade"}
                </Button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
