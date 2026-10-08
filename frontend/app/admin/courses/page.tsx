"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCourses } from "@/lib/api/courses";
import type { CourseListItem } from "@/types/api";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let x=false; (async()=>{ try { const p=await getCourses({ page:1 }); if(!x) setCourses(p.results||[]); } catch(e){ if(!x) setError(e instanceof ApiError?e.message:"Could not load courses."); } finally { if(!x) setLoading(false);} })(); return ()=>{x=true}; }, []);
  return (
    <div>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol">{error}</p> : null}
      <ul className="list-none divide-y divide-line border border-line p-0">
        {courses.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div><p className="text-sm text-petrol">{c.title}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{c.slug} · {c.is_published ? "published" : "unpublished"}</p></div>
            <Link href={"/courses/" + c.slug} className="font-mono text-[11px] uppercase tracking-[0.1em] text-petrol">View</Link>
          </li>
        ))}
        {!loading && courses.length === 0 ? <li className="px-4 py-8 text-center text-ink-muted">No courses.</li> : null}
      </ul>
    </div>
  );
}
