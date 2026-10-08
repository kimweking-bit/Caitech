"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/ui/Container";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="staff">
      <Container className="py-10 md:py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">Operations</p>
        <h1 className="mt-2 font-display text-3xl text-petrol md:text-4xl">Admin</h1>
        <div className="mt-8"><AdminNav /></div>
        <div className="mt-8">{children}</div>
      </Container>
    </RequireRole>
  );
}
