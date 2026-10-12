"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { PortalShell } from "@/components/portal/PortalShell";
import type { PortalNavItem } from "@/components/portal/types";

const NAV: PortalNavItem[] = [
  { href: "/admin", label: "Overview", exact: true, group: "Control" },
  { href: "/admin/courses", label: "Courses", group: "Academic" },
  { href: "/admin/enrollments", label: "Enrollments", group: "Academic" },
  { href: "/admin/students", label: "Students", group: "People" },
  { href: "/admin/instructors", label: "Instructors", group: "People" },
  { href: "/admin/users", label: "All users", group: "People" },
  { href: "/admin/orders", label: "Orders", group: "Commerce" },
  { href: "/admin/payments", label: "Payments", group: "Commerce" },
  { href: "/admin/inquiries", label: "Inquiries", group: "Front desk" },
  { href: "/admin/blog", label: "Blog", group: "Content" },
  { href: "/admin/newsletter", label: "Newsletter", group: "Content" },
  { href: "/admin/notifications", label: "Notifications", group: "System" },
  { href: "/admin/reports", label: "Reports", group: "System" },
  { href: "/admin/settings", label: "Settings", group: "System" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="admin">
      <PortalShell kind="admin" nav={NAV}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
