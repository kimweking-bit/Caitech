"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, getEnrollmentReport, listAdminEnrollments } from "@/lib/api/lms";
import { listAdminUsers, listInquiries, listNotifications } from "@/lib/api/admin-ops";
import { listOrders } from "@/lib/api/payments";
import { getCourses } from "@/lib/api/courses";

type Card = { label: string; value: string };

export default function AdminOverviewPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let c=false; (async()=>{
    try {
      const [users, courses, enrollments, orders, inquiries, notes, report] = await Promise.all([
        listAdminUsers(1).catch(()=>[]), getCourses({ page:1 }).catch(()=>({ results:[], count:0 })),
        listAdminEnrollments(1).catch(()=>[]), listOrders().catch(()=>[]),
        listInquiries(1).catch(()=>[]), listNotifications(1).catch(()=>[]),
        getEnrollmentReport(1).catch(()=>null),
      ]);
      if (c) return;
      const userCount = Array.isArray(users) ? users.length : (users as {count?:number}).count ?? asList(users).length;
      const courseCount = (courses as {count?:number}).count ?? (courses as {results?:unknown[]}).results?.length ?? 0;
      const enrList = asList(enrollments as never);
      const enrCount = Array.isArray(enrollments) ? enrollments.length : (enrollments as {count?:number}).count ?? enrList.length;
      const orderList = Array.isArray(orders) ? orders : [];
      const inq = asList(inquiries as never);
      const notif = asList(notes as never);
      const summary = report && typeof report === "object" && "summary" in (report as object) ? (report as {summary?: {total_students?:number; total_courses?:number}}).summary : null;
      setCards([
        { label: "Users (page)", value: String(summary?.total_students ?? userCount) },
        { label: "Courses", value: String(summary?.total_courses ?? courseCount) },
        { label: "Enrollments (page)", value: String(enrCount) },
        { label: "Orders (loaded)", value: String(orderList.length) },
        { label: "Inquiries (page)", value: String(Array.isArray(inquiries)?inquiries.length:(inquiries as {count?:number}).count ?? inq.length) },
        { label: "Notifications (page)", value: String(Array.isArray(notes)?notes.length:(notes as {count?:number}).count ?? notif.length) },
      ]);
    } catch(e) { if(!c) setError(e instanceof ApiError ? e.message : "Could not load overview."); }
    finally { if(!c) setLoading(false); }
  })(); return ()=>{c=true}; }, []);
  if (loading) return <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading overview…</p>;
  if (error) return <p className="text-sm text-petrol" role="alert">{error}</p>;
  return (
    <div>
      <p className="text-sm text-ink-muted">Figures come from live API responses only. Empty means no data in this window.</p>
      <ul className="mt-6 grid list-none grid-cols-2 gap-0 border border-line p-0 md:grid-cols-3">
        {cards.map((c)=>(<li key={c.label} className="border-b border-r border-line p-5 last:border-b-0"><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">{c.label}</p><p className="mt-2 font-display text-3xl text-petrol">{c.value}</p></li>))}
      </ul>
    </div>
  );
}
