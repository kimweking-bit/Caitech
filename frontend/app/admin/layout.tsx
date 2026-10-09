"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { PortalShell } from "@/components/portal/PortalShell";
import type { PortalNavItem } from "@/components/portal/types";

const nav: PortalNavItem[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/instructors", label: "Instructors" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/notifications", label: "Notifications" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="admin">
      <PortalShell kind="admin" nav={nav}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
