"use client";

import Link from "next/link";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { asList, getAssignment, getCourseAssignments, getCourseQuizzes, getCourseResources, getCourseSections, getEnrollmentProgress, getLesson, getQuiz, getSectionLessons, getStudentDashboard, listQuizAttempts, listSubmissions, markLessonProgress, resourceDownloadPath, submitAssignment, submitQuizAttempt, submitCourseReview } from "@/lib/api/lms";
import type { Assignment, AssignmentSubmission, CourseLesson, CourseResource, CourseSection, DashboardEnrollment, EnrollmentProgress, Quiz, QuizAttempt } from "@/types/api";
import { getAccessToken } from "@/lib/auth/tokens";
import { displayTitle } from "@/lib/utils/display";

type Tab = "lessons" | "resources" | "quizzes" | "assignments";

function LearnInner() {
  const params = useParams();
  const search = useSearchParams();
  const slug = String(params.slug || "");
  const enrollmentQ = search.get("enrollment");
  const [enrollment, setEnrollment] = useState<DashboardEnrollment | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessonsBySection, setLessonsBySection] = useState<Record<number, CourseLesson[]>>({});
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tab, setTab] = useState<Tab>("lessons");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [mySubmission, setMySubmission] = useState<AssignmentSubmission | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const flatLessons = useMemo(() => { const list: CourseLesson[] = []; for (const s of sections) list.push(...(lessonsBySection[s.id] || [])); return list; }, [sections, lessonsBySection]);
  const completedSet = useMemo(() => { const s = new Set<number>(); for (const row of progress?.lessons || []) if (row.completed) s.add(row.lesson); return s; }, [progress]);
  const load = useCallback(async () => {
    setError(null); setLoading(true);
    try {
      const dash = await getStudentDashboard();
      const enr = dash.my_courses.find((c) => String(c.id) === enrollmentQ) || dash.my_courses.find((c) => c.course_slug === slug);
      if (!enr) { setError("You are not enrolled in this course."); return; }
      setEnrollment(enr);
      const [prog, secData, resData, quizData, asgData] = await Promise.all([
        getEnrollmentProgress(enr.id), getCourseSections(enr.course_id),
        getCourseResources(enr.course_id).catch(() => []), getCourseQuizzes(enr.course_id).catch(() => []),
        getCourseAssignments(enr.course_id).catch(() => []),
      ]);
      setProgress(prog);
      const secs = asList(secData).sort((a, b) => a.order - b.order);
      setSections(secs); setResources(asList(resData)); setQuizzes(asList(quizData)); setAssignments(asList(asgData));
      const map: Record<number, CourseLesson[]> = {};
      await Promise.all(secs.map(async (s) => { map[s.id] = asList(await getSectionLessons(s.id)).sort((a, b) => a.order - b.order); }));
      setLessonsBySection(map);
      const all = secs.flatMap((s) => map[s.id] || []);
      const first = all.find((l) => !prog.lessons.some((r) => r.lesson === l.id && r.completed)) || all[0];
      if (first) { setActiveLessonId(first.id); setLesson(await getLesson(first.id)); }
    } catch (e) { setError(e instanceof ApiError ? e.message : "Could not open course room."); }
    finally { setLoading(false); }
  }, [enrollmentQ, slug]);
  useEffect(() => { void load(); }, [load]);
  async function openLesson(id: number) { setBusy(true); setMsg(null); setTab("lessons"); try { setLesson(await getLesson(id)); setActiveLessonId(id); } catch (e) { setMsg(e instanceof ApiError ? e.message : "Could not load lesson."); } finally { setBusy(false); } }
  async function completeLesson() { if (!enrollment || !activeLessonId) return; setBusy(true); setMsg(null); try { await markLessonProgress(enrollment.id, activeLessonId, true); setProgress(await getEnrollmentProgress(enrollment.id)); setMsg("Lesson marked complete."); const idx = flatLessons.findIndex((l) => l.id === activeLessonId); const next = flatLessons[idx + 1]; if (next) await openLesson(next.id); } catch (e) { setMsg(e instanceof ApiError ? e.message : "Could not update progress."); } finally { setBusy(false); } }
  async function openQuiz(id: number) { setBusy(true); setMsg(null); setQuizResult(null); setAnswers({}); try { setActiveQuiz(await getQuiz(id)); setAttempts(asList(await listQuizAttempts(id))); setTab("quizzes"); } catch (e) { setMsg(e instanceof ApiError ? e.message : "Could not load quiz."); } finally { setBusy(false); } }
  async function onSubmitQuiz(e: FormEvent) { e.preventDefault(); if (!activeQuiz) return; setBusy(true); setMsg(null); try { const payload = (activeQuiz.questions || []).map((q) => ({ question: q.id, choices: answers[q.id] || [] })); setQuizResult(await submitQuizAttempt(activeQuiz.id, payload)); setAttempts(asList(await listQuizAttempts(activeQuiz.id))); setMsg("Attempt submitted."); } catch (err) { setMsg(err instanceof ApiError ? err.message : "Quiz submission failed."); } finally { setBusy(false); } }
  async function openAssignment(id: number) { setBusy(true); setMsg(null); try { setActiveAssignment(await getAssignment(id)); const subs = asList(await listSubmissions(id)); setMySubmission(subs[0] || null); setSubmissionText(subs[0]?.content || ""); setTab("assignments"); } catch (e) { setMsg(e instanceof ApiError ? e.message : "Could not load assignment."); } finally { setBusy(false); } }
  async function onSubmitAssignment(e: FormEvent) { e.preventDefault(); if (!activeAssignment) return; setBusy(true); setMsg(null); try { setMySubmission(await submitAssignment(activeAssignment.id, submissionText.trim())); setMsg("Assignment submitted."); } catch (err) { setMsg(err instanceof ApiError ? err.message : "Submission failed."); } finally { setBusy(false); } }
  async function downloadResource(id: number) { const token = getAccessToken(); try { const res = await fetch(resourceDownloadPath(id), { headers: token ? { Authorization: "Bearer " + token } : {} }); if (!res.ok) throw new Error("fail"); const blob = await res.blob(); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "resource"; a.click(); URL.revokeObjectURL(a.href); } catch { setMsg("Could not download resource."); } }
  async function onReview(e: FormEvent) { e.preventDefault(); if (!enrollment) return; setBusy(true); try { await submitCourseReview(enrollment.course_slug, rating, comment.trim()); setMsg("Review submitted."); setComment(""); } catch (err) { setMsg(err instanceof ApiError ? err.message : "Could not submit review."); } finally { setBusy(false); } }
  if (loading) return (<Container className="py-16"><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Opening course room…</p></Container>);
  if (error || !enrollment) return (<Container className="py-16 text-center"><p className="text-sm text-petrol">{error || "Course unavailable."}</p><div className="mt-6 flex justify-center gap-3"><Button href="/account" variant="lime">My courses</Button><Button href="/courses" variant="secondary">Catalogue</Button></div></Container>);
  const pct = progress?.progress_percentage ?? enrollment.progress_percentage;
  return (
    <div className="border-t border-line"><Container className="py-8 md:py-10">
      <p className="mb-4"><Link href="/account" className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted hover:text-petrol">← My courses</Link></p>
      <h1 className="font-display text-3xl text-petrol md:text-4xl">{displayTitle(enrollment.course_title)}</h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{progress ? (progress.completed_lessons + "/" + progress.total_lessons + " lessons · " + pct + "%") : (String(pct) + "%")}</p>
      <div className="mt-3 h-1.5 w-full max-w-md bg-line"><div className="h-full bg-lime" style={{ width: Math.min(100, Number(pct) || 0) + "%" }} /></div>
      {msg ? <p className="mt-4 text-sm text-ink-muted" role="status">{msg}</p> : null}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-3">
        {([["lessons","Lessons"],["resources","Resources"],["quizzes","Quizzes"],["assignments","Assignments"]] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={tab === id ? "border border-petrol bg-petrol px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ground" : "border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:border-petrol"}>{label}</button>
        ))}
      </div>
      {tab === "lessons" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="Sections" className="space-y-4">{sections.map((s) => (<div key={s.id}><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">{s.title}</p><ul className="mt-2 list-none space-y-1 p-0">{(lessonsBySection[s.id] || []).map((l) => (<li key={l.id}><button type="button" disabled={busy} onClick={() => void openLesson(l.id)} className={"w-full px-2 py-2 text-left text-sm " + (activeLessonId === l.id ? "bg-petrol text-ground" : "text-petrol hover:bg-surface")}><span className="mr-2 font-mono text-[10px] opacity-70">{completedSet.has(l.id) ? "OK" : "-"}</span>{l.title}</button></li>))}</ul></div>))}{sections.length === 0 ? <p className="text-sm text-ink-muted">No sections published yet.</p> : null}</nav>
          <div>{lesson ? (<article className="space-y-6"><h2 className="font-display text-2xl text-petrol">{lesson.title}</h2>{lesson.video_url ? (<div className="aspect-video overflow-hidden border border-line bg-petrol/5">{/youtube|vimeo|youtu.be/i.test(lesson.video_url) ? <iframe title={lesson.title} src={lesson.video_url} className="h-full w-full" allowFullScreen /> : <video controls className="h-full w-full" src={lesson.video_url} />}</div>) : <p className="text-sm text-ink-muted">No video for this lesson.</p>}<Button type="button" variant="lime" disabled={busy || completedSet.has(lesson.id)} onClick={() => void completeLesson()}>{completedSet.has(lesson.id) ? "Completed" : busy ? "Saving..." : "Mark complete"}</Button></article>) : <p className="text-sm text-ink-muted">Select a lesson to begin.</p>}
            <form onSubmit={onReview} className="mt-12 max-w-md space-y-4 border-t border-line pt-8"><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Course review</p><Input id="rating" label="Rating (1-5)" type="number" min={1} max={5} value={String(rating)} onChange={(e) => setRating(Number(e.target.value))} disabled={busy} /><Textarea id="comment" label="Comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} disabled={busy} /><Button type="submit" variant="secondary" disabled={busy}>Submit review</Button></form></div></div>) : null}
      {tab === "resources" ? (<div className="mt-8">{resources.length === 0 ? <p className="text-sm text-ink-muted">No resources for this course.</p> : (<ul className="list-none divide-y divide-line border border-line p-0">{resources.map((r) => (<li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><span className="text-sm text-petrol">{r.title}</span><Button type="button" variant="secondary" onClick={() => void downloadResource(r.id)}>Download</Button></li>))}</ul>)}</div>) : null}
      {tab === "quizzes" ? (<div className="mt-8 grid gap-8 lg:grid-cols-[14rem_1fr]"><ul className="list-none space-y-1 p-0">{quizzes.map((q) => (<li key={q.id}><button type="button" className={"w-full px-2 py-2 text-left text-sm " + (activeQuiz?.id === q.id ? "bg-petrol text-ground" : "text-petrol hover:bg-surface")} onClick={() => void openQuiz(q.id)}>{q.title}</button></li>))}{quizzes.length === 0 ? <p className="text-sm text-ink-muted">No quizzes yet.</p> : null}</ul><div>{activeQuiz ? (<div className="space-y-6"><h2 className="font-display text-2xl text-petrol">{activeQuiz.title}</h2>{activeQuiz.description ? <p className="text-sm text-ink-muted">{activeQuiz.description}</p> : null}{attempts.length ? <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Attempts: {attempts.length}{attempts[0] ? " · last score " + attempts[0].score + "/" + attempts[0].total_points : ""}</p> : null}{quizResult ? <div className="border border-line bg-surface px-4 py-4 text-sm text-petrol">Score {quizResult.score} / {quizResult.total_points}</div> : null}<form onSubmit={onSubmitQuiz} className="space-y-6">{(activeQuiz.questions || []).map((q) => (<fieldset key={q.id} className="border border-line p-4"><legend className="px-1 text-sm font-medium text-petrol">{q.prompt}</legend><div className="mt-3 space-y-2">{(q.choices || []).map((ch) => { const selected = (answers[q.id] || []).includes(ch.id); return (<label key={ch.id} className="flex cursor-pointer items-start gap-2 text-sm"><input type={q.allow_multiple ? "checkbox" : "radio"} name={"q-" + q.id} checked={selected} onChange={() => { setAnswers((prev) => { if (q.allow_multiple) { const cur = new Set(prev[q.id] || []); if (cur.has(ch.id)) cur.delete(ch.id); else cur.add(ch.id); return { ...prev, [q.id]: [...cur] }; } return { ...prev, [q.id]: [ch.id] }; }); }} />{ch.text}</label>); })}</div></fieldset>))}<Button type="submit" variant="lime" disabled={busy}>{busy ? "Submitting..." : "Submit attempt"}</Button></form></div>) : <p className="text-sm text-ink-muted">Select a quiz.</p>}</div></div>) : null}
      {tab === "assignments" ? (<div className="mt-8 grid gap-8 lg:grid-cols-[14rem_1fr]"><ul className="list-none space-y-1 p-0">{assignments.map((a) => (<li key={a.id}><button type="button" className={"w-full px-2 py-2 text-left text-sm " + (activeAssignment?.id === a.id ? "bg-petrol text-ground" : "text-petrol hover:bg-surface")} onClick={() => void openAssignment(a.id)}>{a.title}</button></li>))}{assignments.length === 0 ? <p className="text-sm text-ink-muted">No assignments yet.</p> : null}</ul><div>{activeAssignment ? (<div className="space-y-6"><h2 className="font-display text-2xl text-petrol">{activeAssignment.title}</h2><p className="whitespace-pre-line text-sm text-ink-muted">{activeAssignment.description}</p>{activeAssignment.due_at ? <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Due {new Date(activeAssignment.due_at).toLocaleString()}</p> : null}{mySubmission ? (<div className="border border-line bg-surface px-4 py-4 text-sm"><p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Your submission</p>{mySubmission.grade != null ? <p className="mt-2 text-petrol">Grade: {mySubmission.grade}{mySubmission.feedback ? " - " + mySubmission.feedback : ""}</p> : <p className="mt-2 text-ink-muted">Awaiting review.</p>}</div>) : null}<form onSubmit={onSubmitAssignment} className="space-y-4"><Textarea id="submission" label="Your work" rows={8} required value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} disabled={busy} /><Button type="submit" variant="lime" disabled={busy}>{busy ? "Submitting..." : mySubmission ? "Resubmit" : "Submit"}</Button></form></div>) : <p className="text-sm text-ink-muted">Select an assignment.</p>}</div></div>) : null}
    </Container></div>
  );
}

export default function LearnPage() {
  return (<RequireAuth><Suspense fallback={<Container className="py-16"><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading...</p></Container>}><LearnInner /></Suspense></RequireAuth>);
}
