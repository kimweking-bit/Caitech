"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center" aria-busy>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Checking session…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
