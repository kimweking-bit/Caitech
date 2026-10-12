"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  listAdminUsers,
  listContactInquiries,
  listInstructorApplications,
} from "@/lib/api/admin-ops";
import { listAdminEnrollments } from "@/lib/api/lms";
import { getCourses } from "@/lib/api/courses";
import { listOrders } from "@/lib/api/payments";
import type { Order } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { MetricCard, MetricGrid } from "@/components/portal/MetricGrid";
import { SectionCard } from "@/components/portal/SectionCard";
import { formatMoney } from "@/lib/utils/format";

type Report = {
  students: number;
  instructors: number;
  courses: number;
  enrollments: number;
  completed: number;
  orders: number;
  paid: number;
  pending: number;
  failed: number;
  revenue: number;
  inquiries: number;
  applications: number;
};

export default function AdminReportsPage() {
  const [r, setR] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [users, courses, enrollments, inquiries, apps, allOrders] =
          await Promise.all([
            listAdminUsers(1).catch(() => []),
            getCourses({ page: 1 }).catch(() => ({ results: [], count: 0 })),
            listAdminEnrollments(1).catch(() => []),
            listContactInquiries(1).catch(() => []),
            listInstructorApplications(1).catch(() => []),
            listOrders().catch(() => [] as Order[]),
          ]);

        const userList = asList(users);
        const enList = asList(enrollments);
        const paid = allOrders.filter((o) => o.status === "paid");
        const report: Report = {
          students: userList.filter((u) => u.is_student && !u.is_staff).length,
          instructors: userList.filter((u) => u.is_instructor && !u.is_staff)
            .length,
          courses: Number(
            (courses as { count?: number; results?: unknown[] })?.count ??
              (courses as { results?: unknown[] })?.results?.length ??
              0,
          ),
          enrollments: enList.length,
          completed: enList.filter((e) => e.completed).length,
          orders: allOrders.length,
          paid: paid.length,
          pending: allOrders.filter((o) => o.status === "pending").length,
          failed: allOrders.filter((o) => o.status === "failed").length,
          revenue: paid.reduce((s, o) => s + Number(o.total || 0), 0),
          inquiries: asList(inquiries).length,
          applications: asList(apps).length,
        };
        if (!c) setR(report);
      } catch (e) {
        if (!c)
          setError(e instanceof ApiError ? e.message : "Could not build report.");
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Institution reports"
        description="Snapshot from live APIs — not a warehouse. Figures reflect current operational state."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {r ? (
        <>
          <MetricGrid>
            <MetricCard label="Students" value={r.students} />
            <MetricCard label="Instructors" value={r.instructors} />
            <MetricCard label="Courses" value={r.courses} />
            <MetricCard label="Enrollments" value={r.enrollments} />
            <MetricCard label="Completed enrollments" value={r.completed} />
            <MetricCard
              label="Paid revenue (KES)"
              value={formatMoney(String(r.revenue), "KES") || "KES 0"}
            />
          </MetricGrid>

          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard title="Commerce">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase text-ink-muted">
                    Orders
                  </dt>
                  <dd className="font-display text-2xl text-petrol">{r.orders}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase text-ink-muted">
                    Paid
                  </dt>
                  <dd className="font-display text-2xl text-petrol">{r.paid}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase text-ink-muted">
                    Pending
                  </dt>
                  <dd className="font-display text-2xl text-petrol">{r.pending}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase text-ink-muted">
                    Failed
                  </dt>
                  <dd className="font-display text-2xl text-petrol">{r.failed}</dd>
                </div>
              </dl>
            </SectionCard>
            <SectionCard title="Front desk">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase text-ink-muted">
                    Inquiries
                  </dt>
                  <dd className="font-display text-2xl text-petrol">
                    {r.inquiries}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase text-ink-muted">
                    Instructor applications
                  </dt>
                  <dd className="font-display text-2xl text-petrol">
                    {r.applications}
                  </dd>
                </div>
              </dl>
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
