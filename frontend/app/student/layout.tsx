"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { PortalShell } from "@/components/portal/PortalShell";
import type { PortalNavItem } from "@/components/portal/types";

const NAV: PortalNavItem[] = [
  { href: "/student", label: "Dashboard", exact: true },
  { href: "/student/learning", label: "My Learning" },
  { href: "/student/assignments", label: "Assignments" },
  { href: "/student/quizzes", label: "Quizzes" },
  { href: "/student/certificates", label: "Certificates" },
  { href: "/student/orders", label: "Orders & payments" },
  { href: "/student/notifications", label: "Notifications" },
  { href: "/student/profile", label: "Profile" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="student">
      <PortalShell kind="student" nav={NAV}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
