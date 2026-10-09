"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { PortalShell } from "@/components/portal/PortalShell";
import type { PortalNavItem } from "@/components/portal/types";

const nav: PortalNavItem[] = [
  { href: "/student", label: "Dashboard", exact: true },
  { href: "/student/learning", label: "My Learning" },
  { href: "/student/assignments", label: "Assignments" },
  { href: "/student/quizzes", label: "Quizzes" },
  { href: "/student/certificates", label: "Certificates" },
  { href: "/student/orders", label: "Orders" },
  { href: "/student/profile", label: "Profile" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="student">
      <PortalShell kind="student" nav={nav}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
