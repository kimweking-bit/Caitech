"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  asList,
  listAdminUsers,
  listContactInquiries,
  listInstructorApplications,
  listAdminNotifications,
} from "@/lib/api/admin-ops";
import {
  asList as asListLms,
  getEnrollmentReport,
  listAdminEnrollments,
} from "@/lib/api/lms";
import { listOrders } from "@/lib/api/payments";
import { getCourses } from "@/lib/api/courses";
import { PageHeader } from "@/components/portal/PageHeader";
import { MetricCard, MetricGrid } from "@/components/portal/MetricGrid";
import { SectionCard } from "@/components/portal/SectionCard";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Button } from "@/components/ui/Button";

function countOf(data: unknown): number {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data === "object" && data && "count" in data)
    return Number((data as { count?: number }).count ?? 0);
  return asList(data as never).length;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [attention, setAttention] = useState<
    { label: string; href: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [
          users,
          courses,
          enrollments,
          orders,
          inquiries,
          notes,
          apps,
          report,
        ] = await Promise.all([
          listAdminUsers(1).catch(() => []),
          getCourses({ page: 1 }).catch(() => ({ results: [], count: 0 })),
          listAdminEnrollments(1).catch(() => []),
          listOrders().catch(() => []),
          listContactInquiries(1).catch(() => []),
          listAdminNotifications(1).catch(() => []),
          listInstructorApplications(1).catch(() => []),
          getEnrollmentReport(1).catch(() => null),
        ]);
        if (c) return;
        const summary =
          report && typeof report === "object" && "summary" in report
            ? (
                report as {
                  summary?: {
                    total_students?: number;
                    total_courses?: number;
                    total_enrollments?: number;
                  };
                }
              ).summary
            : null;
        const orderList = Array.isArray(orders) ? orders : [];
        const paid = orderList.filter((o) =>
          String(o.status).toLowerCase().includes("paid"),
        ).length;
        const failed = orderList.filter((o) => {
          const s = String(o.status).toLowerCase();
          return s.includes("fail") || s.includes("cancel");
        }).length;
        const pendingApps = asList(apps as never).filter((a) =>
          String((a as { status?: string }).status || "")
            .toLowerCase()
            .includes("pend"),
        ).length;
        const inqCount = countOf(inquiries);
        setMetrics({
          students: summary?.total_students ?? countOf(users),
          courses:
            summary?.total_courses ??
            Number(
              (courses as { count?: number }).count ??
                (courses as { results?: unknown[] }).results?.length ??
                0,
            ),
          enrollments: summary?.total_enrollments ?? countOf(enrollments),
          orders: orderList.length,
          paid,
          inquiries: inqCount,
          notifications: countOf(notes),
          applications: countOf(apps),
        });
        setAttention(
          [
            {
              label: "Instructor applications",
              href: "/admin/instructors",
              count: pendingApps || countOf(apps),
            },
            {
              label: "Contact inquiries",
              href: "/admin/inquiries",
              count: inqCount,
            },
            {
              label: "Failed / cancelled orders",
              href: "/admin/orders",
              count: failed,
            },
            {
              label: "Enrolments (page window)",
              href: "/admin/enrollments",
              count: asListLms(enrollments as never).length,
            },
          ].filter((x) => x.count > 0),
        );
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load overview.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Institution overview"
        description="Live figures from CAITECH APIs. Empty values mean no rows in the current response window."
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error ? (
        <>
          <MetricGrid>
            <MetricCard label="Students / users" value={metrics.students ?? 0} />
            <MetricCard label="Courses" value={metrics.courses ?? 0} />
            <MetricCard label="Enrolments" value={metrics.enrollments ?? 0} />
            <MetricCard
              label="Orders loaded"
              value={metrics.orders ?? 0}
              hint={`${metrics.paid ?? 0} paid`}
            />
          </MetricGrid>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Requires attention">
              {attention.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  No open operational queues in the current data window.
                </p>
              ) : (
                <ul className="list-none space-y-3 p-0">
                  {attention.map((a) => (
                    <li
                      key={a.href}
                      className="flex items-center justify-between gap-3 border-b border-line pb-2"
                    >
                      <div>
                        <p className="text-sm text-petrol">{a.label}</p>
                        <StatusBadge tone="warning">{String(a.count)}</StatusBadge>
                      </div>
                      <Link
                        href={a.href}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-petrol hover:underline"
                      >
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Quick links">
              <div className="flex flex-wrap gap-2">
                <Button href="/admin/courses" variant="secondary">
                  Courses
                </Button>
                <Button href="/admin/students" variant="secondary">
                  Students
                </Button>
                <Button href="/admin/enrollments" variant="secondary">
                  Enrolments
                </Button>
                <Button href="/admin/orders" variant="secondary">
                  Orders
                </Button>
                <Button href="/admin/inquiries" variant="lime">
                  Inquiries
                </Button>
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                Detailed CRUD for curriculum media remains available in Django
                admin when staff need deep edits.
              </p>
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
