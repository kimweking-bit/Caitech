"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { portalHome } from "@/lib/portal/roles";

/** Legacy /account → role portal home */
export default function AccountRedirectPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/student");
      return;
    }
    router.replace(portalHome(user));
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="px-4 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        Opening your portal…
      </p>
    </div>
  );
}
