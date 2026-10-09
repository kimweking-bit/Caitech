"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { PortalShell } from "@/components/portal/PortalShell";
import type { PortalNavItem } from "@/components/portal/types";

const nav: PortalNavItem[] = [
  { href: "/instructor", label: "Dashboard", exact: true },
  { href: "/instructor/courses", label: "My Courses" },
  { href: "/instructor/students", label: "Students" },
  { href: "/instructor/grading", label: "Grading" },
  { href: "/instructor/reviews", label: "Reviews" },
  { href: "/instructor/analytics", label: "Analytics" },
  { href: "/instructor/profile", label: "Profile" },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="instructor">
      <PortalShell kind="instructor" nav={nav}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
