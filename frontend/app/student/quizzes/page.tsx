"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  getCourseQuizzes,
  getQuiz,
  getStudentDashboard,
  listQuizAttempts,
  submitQuizAttempt,
} from "@/lib/api/lms";
import { displayTitle } from "@/lib/utils/display";
import type {
  DashboardEnrollment,
  Quiz,
  QuizAttempt,
} from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

type Row = {
  course: DashboardEnrollment;
  quiz: Quiz;
  attempts: QuizAttempt[];
};

export default function StudentQuizzesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const [detail, setDetail] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const dash = await getStudentDashboard(1);
        const out: Row[] = [];
        for (const course of dash.my_courses || []) {
          const quizzes = asList(
            await getCourseQuizzes(course.course_id).catch(() => []),
          );
          for (const quiz of quizzes) {
            const attempts = asList(
              await listQuizAttempts(quiz.id).catch(() => []),
            );
            out.push({ course, quiz, attempts });
          }
        }
        if (!c) setRows(out);
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load quizzes.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  async function openQuiz(row: Row) {
    setActive(row);
    setMsg(null);
    setAnswers({});
    setBusy(true);
    try {
      setDetail(await getQuiz(row.quiz.id));
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not open quiz.");
      setDetail(null);
    } finally {
      setBusy(false);
    }
  }

  function toggleChoice(questionId: number, choiceId: number, multi: boolean) {
    setAnswers((prev) => {
      const cur = prev[questionId] || [];
      if (multi) {
        return {
          ...prev,
          [questionId]: cur.includes(choiceId)
            ? cur.filter((x) => x !== choiceId)
            : [...cur, choiceId],
        };
      }
      return { ...prev, [questionId]: [choiceId] };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!active || !detail) return;
    setBusy(true);
    setMsg(null);
    try {
      const payload = (detail.questions || []).map((q) => ({
        question: q.id,
        choices: answers[q.id] || [],
      }));
      const attempt = await submitQuizAttempt(active.quiz.id, payload);
      setMsg(
        attempt.score != null
          ? `Submitted. Score: ${attempt.score}`
          : "Attempt submitted.",
      );
      const attempts = asList(await listQuizAttempts(active.quiz.id));
      setActive({ ...active, attempts });
      setRows((prev) =>
        prev.map((r) =>
          r.quiz.id === active.quiz.id ? { ...r, attempts } : r,
        ),
      );
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Could not submit quiz.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessments"
        title="Quizzes"
        description="Available and completed quizzes for your enrolments."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="No quizzes"
          description="Quizzes appear when your programmes include them."
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ul className="list-none space-y-2 p-0">
          {rows.map((row) => {
            const best = row.attempts
              .map((a) => Number(a.score))
              .filter((n) => Number.isFinite(n))
              .sort((a, b) => b - a)[0];
            const selected = active?.quiz.id === row.quiz.id;
            return (
              <li key={row.quiz.id}>
                <button
                  type="button"
                  onClick={() => void openQuiz(row)}
                  className={
                    "w-full border border-line px-4 py-3 text-left " +
                    (selected ? "bg-petrol text-ground" : "bg-surface")
                  }
                >
                  <p className="font-display text-lg text-inherit">
                    {row.quiz.title}
                  </p>
                  <p
                    className={
                      "mt-1 font-mono text-[11px] uppercase tracking-[0.12em] " +
                      (selected ? "text-ground/70" : "text-ink-muted")
                    }
                  >
                    {displayTitle(row.course.course_title)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge tone={row.attempts.length ? "info" : "neutral"}>
                      {row.attempts.length
                        ? `${row.attempts.length} attempt(s)`
                        : "Not attempted"}
                    </StatusBadge>
                    {best != null ? (
                      <StatusBadge tone="success">Best {best}</StatusBadge>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div>
          {!active ? (
            <p className="text-sm text-ink-muted">Select a quiz to attempt.</p>
          ) : (
            <SectionCard title={active.quiz.title}>
              {msg ? (
                <p className="mb-3 text-sm text-ink-muted" role="status">
                  {msg}
                </p>
              ) : null}
              {!detail ? (
                <p className="text-sm text-ink-muted">
                  {busy ? "Loading quiz…" : "Quiz detail unavailable."}
                </p>
              ) : (
                <form className="space-y-6" onSubmit={onSubmit}>
                  {(detail.questions || []).map((q, qi) => (
                    <fieldset key={q.id} className="border border-line p-3">
                      <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                        Question {qi + 1}
                      </legend>
                      <p className="mt-1 text-sm text-petrol">{q.prompt}</p>
                      <ul className="mt-3 list-none space-y-2 p-0">
                        {(q.choices || []).map((ch) => {
                          const multi = Boolean(q.allow_multiple);
                          const checked = (answers[q.id] || []).includes(ch.id);
                          return (
                            <li key={ch.id}>
                              <label className="flex cursor-pointer items-start gap-2 text-sm">
                                <input
                                  type={multi ? "checkbox" : "radio"}
                                  name={`q-${q.id}`}
                                  checked={checked}
                                  onChange={() =>
                                    toggleChoice(q.id, ch.id, multi)
                                  }
                                  disabled={busy}
                                  className="mt-1"
                                />
                                <span>{ch.text}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </fieldset>
                  ))}
                  <Button type="submit" variant="lime" disabled={busy}>
                    {busy ? "Submitting…" : "Submit attempt"}
                  </Button>
                </form>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
