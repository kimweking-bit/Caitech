"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Operations settings"
        description="Account context for the signed-in staff operator. Platform secrets stay on the server."
      />

      <SectionCard title="Signed-in operator">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              Name
            </dt>
            <dd className="text-petrol">
              {[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
                user?.username}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              Email
            </dt>
            <dd className="text-petrol">{user?.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              Staff
            </dt>
            <dd className="text-petrol">{user?.is_staff ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              Username
            </dt>
            <dd className="font-mono text-sm text-petrol">{user?.username}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Operational shortcuts">
        <ul className="list-none space-y-2 p-0 text-sm">
          <li>
            <Link className="text-petrol underline-offset-4 hover:underline" href="/admin/courses">
              Manage courses
            </Link>
          </li>
          <li>
            <Link className="text-petrol underline-offset-4 hover:underline" href="/admin/instructors">
              Instructor applications
            </Link>
          </li>
          <li>
            <Link className="text-petrol underline-offset-4 hover:underline" href="/admin/payments">
              Orders & payments
            </Link>
          </li>
          <li>
            <Link className="text-petrol underline-offset-4 hover:underline" href="/admin/notifications">
              System notifications
            </Link>
          </li>
          <li>
            <Link className="text-petrol underline-offset-4 hover:underline" href="/">
              Public site
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-xs text-ink-muted">
          Payment credentials, WhatsApp tokens, and AI keys are never exposed in
          this UI. Configure them via server environment only.
        </p>
      </SectionCard>
    </div>
  );
}
