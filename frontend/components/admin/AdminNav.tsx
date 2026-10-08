"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/notifications", label: "Notifications" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-2 border-b border-line pb-4">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
        return (<Link key={l.href} href={l.href} className={"px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] no-underline " + (active ? "bg-petrol text-ground" : "text-ink-muted hover:text-petrol")}>{l.label}</Link>);
      })}
    </nav>
  );
}
