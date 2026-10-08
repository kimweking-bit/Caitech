"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listAdminEnrollments, manualEnroll } from "@/lib/api/lms";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AdminEnrollment } from "@/types/api";

export default function AdminEnrollmentsPage() {
  const [rows, setRows] = useState<AdminEnrollment[]>([]);
  const [student, setStudent] = useState("");
  const [course, setCourse] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function load() { setLoading(true); try { setRows(asList(await listAdminEnrollments(1))); } catch(e){ setError(e instanceof ApiError?e.message:"Could not load enrollments."); } finally { setLoading(false);} }
  useEffect(() => { void load(); }, []);
  async function onEnroll(ev: FormEvent) {
    ev.preventDefault(); setBusy(true); setMsg(null);
    try {
      await manualEnroll({ student: Number(student), course: Number(course), note: note.trim() || undefined });
      setMsg("Enrollment created."); setStudent(""); setCourse(""); setNote(""); await load();
    } catch(e){ setMsg(e instanceof ApiError?e.message:"Enrollment failed."); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-10">
      <form onSubmit={onEnroll} className="max-w-lg space-y-4 border border-line p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Manual enrollment</p>
        <Input id="student" label="Student user id" value={student} onChange={(e) => setStudent(e.target.value)} required disabled={busy} />
        <Input id="course" label="Course id" value={course} onChange={(e) => setCourse(e.target.value)} required disabled={busy} />
        <Input id="note" label="Note" value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} />
        <Button type="submit" variant="lime" disabled={busy}>{busy ? "Saving…" : "Enroll"}</Button>
        {msg ? <p className="text-sm text-ink-muted" role="status">{msg}</p> : null}
      </form>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol">{error}</p> : null}
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line bg-surface font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            <tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">When</th><th className="px-3 py-2">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line">
                <td className="px-3 py-2">{r.student_username}</td>
                <td className="px-3 py-2">{r.course_title}</td>
                <td className="px-3 py-2 text-ink-muted">{r.enrolled_at ? new Date(r.enrolled_at).toLocaleString() : "—"}</td>
                <td className="px-3 py-2 font-mono text-[11px] uppercase">{r.completed ? "done" : "active"}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? <tr><td colSpan={4} className="px-3 py-8 text-center text-ink-muted">No enrollments.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
