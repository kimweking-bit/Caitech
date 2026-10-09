"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  getCourseAssignments,
  getStudentDashboard,
  listSubmissions,
  submitAssignment,
} from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type {
  Assignment,
  AssignmentSubmission,
  DashboardEnrollment,
} from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type Row = {
  course: DashboardEnrollment;
  assignment: Assignment;
  submissions: AssignmentSubmission[];
};

function statusOf(subs: AssignmentSubmission[]) {
  const latest = subs[0];
  if (!latest) return { label: "Not started", tone: "neutral" as const };
  if (latest.grade != null && latest.grade !== "")
    return { label: "Graded", tone: "success" as const };
  if (latest.submitted_at)
    return { label: "Submitted", tone: "info" as const };
  return { label: "In progress", tone: "warning" as const };
}

export default function StudentAssignmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const dash = await getStudentDashboard(1);
    const courses = dash.my_courses || [];
    const out: Row[] = [];
    for (const course of courses) {
      const assignments = asList(
        await getCourseAssignments(course.course_id).catch(() => []),
      );
      for (const assignment of assignments) {
        const submissions = asList(
          await listSubmissions(assignment.id).catch(() => []),
        ).sort((a, b) => {
          const ta = a.submitted_at ? Date.parse(a.submitted_at) : 0;
          const tb = b.submitted_at ? Date.parse(b.submitted_at) : 0;
          return tb - ta;
        });
        out.push({ course, assignment, submissions });
      }
    }
    setRows(out);
  }

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load assignments.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!active) return;
    setBusy(true);
    setMsg(null);
    try {
      await submitAssignment(active.assignment.id, content);
      setMsg("Submission saved.");
      setContent("");
      await load();
      const refreshed = rows; // will refresh via load state
      void refreshed;
      const dashRows = await (async () => {
        await load();
        return null;
      })();
      void dashRows;
      const again = await listSubmissions(active.assignment.id);
      setActive({
        ...active,
        submissions: asList(again),
      });
    } catch (err) {
      setMsg(
        err instanceof ApiError ? err.message : "Could not submit assignment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessments"
        title="Assignments"
        description="Submit work and review grades from your instructors."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No assignments"
          description="Assignments appear here when your enrolled programmes include them."
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <ul className="list-none space-y-2 p-0">
          {rows.map((row) => {
            const st = statusOf(row.submissions);
            const selected = active?.assignment.id === row.assignment.id;
            return (
              <li key={row.assignment.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(row);
                    setMsg(null);
                    setContent("");
                  }}
                  className={
                    "w-full border border-line px-4 py-3 text-left " +
                    (selected ? "bg-petrol text-ground" : "bg-surface text-petrol")
                  }
                >
                  <p className="font-display text-lg">
                    {row.assignment.title}
                  </p>
                  <p
                    className={
                      "mt-1 font-mono text-[11px] uppercase tracking-[0.12em] " +
                      (selected ? "text-ground/70" : "text-ink-muted")
                    }
                  >
                    {displayTitle(row.course.course_title)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div>
          {!active ? (
            <p className="text-sm text-ink-muted">
              Select an assignment to submit or review feedback.
            </p>
          ) : (
            <SectionCard title={active.assignment.title}>
              <p className="text-sm text-ink-muted">
                {displayTitle(active.course.course_title)}
                {active.assignment.due_at
                  ? ` · Due ${new Date(active.assignment.due_at).toLocaleString()}`
                  : ""}
              </p>
              {active.assignment.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink">
                  {active.assignment.description}
                </p>
              ) : null}

              {active.submissions[0] ? (
                <div className="mt-4 border border-line bg-ground p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                    Latest submission
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {active.submissions[0].content}
                  </p>
                  {active.submissions[0].grade != null ? (
                    <p className="mt-3 text-sm text-petrol">
                      Grade: {active.submissions[0].grade}
                      {active.submissions[0].feedback
                        ? ` — ${active.submissions[0].feedback}`
                        : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <form className="mt-4 space-y-3" onSubmit={onSubmit}>
                <Textarea
                  id="assignment-content"
                  label="Your submission"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={busy}
                  required
                />
                {msg ? (
                  <p className="text-sm text-ink-muted" role="status">
                    {msg}
                  </p>
                ) : null}
                <Button type="submit" variant="lime" disabled={busy}>
                  {busy ? "Submitting…" : "Submit assignment"}
                </Button>
              </form>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
