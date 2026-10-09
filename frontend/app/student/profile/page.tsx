"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/portal/PageHeader";
import { SectionCard } from "@/components/portal/SectionCard";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { Button } from "@/components/ui/Button";

export default function StudentProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading) return <LoadingBlock label="Loading profile…" />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your CAITECH learner identity."
      />
      <SectionCard title="Identity">
        <dl className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["Username", user?.username],
              ["Email", user?.email],
              ["First name", user?.first_name || "—"],
              ["Last name", user?.last_name || "—"],
              ["Phone", user?.phone_number || "—"],
              ["Role", "Student"],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="border-b border-line pb-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                {k}
              </dt>
              <dd className="mt-1 text-sm text-petrol">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button href="/forgot-password" variant="secondary">
            Reset password
          </Button>
          <Button type="button" variant="ghost" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
