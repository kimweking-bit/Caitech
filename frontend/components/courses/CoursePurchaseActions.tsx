"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { addToCart } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";

export function CoursePurchaseActions({
  courseId,
  slug,
  isAvailable,
  isFree,
}: {
  courseId: number;
  slug: string;
  isAvailable: boolean;
  isFree: boolean;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onAdd() {
    setMsg(null);
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }
    setBusy(true);
    try {
      await addToCart(courseId);
      setMsg(isFree ? "Added. Continue to cart to complete free checkout." : "Added to cart.");
      router.push("/cart");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not add to cart.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
        …
      </p>
    );
  }

  if (!isAvailable) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
        Not currently available
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="lime"
        disabled={busy}
        onClick={() => void onAdd()}
      >
        {busy ? "Adding…" : isFree ? "Enrol free · add to cart" : "Add to cart"}
      </Button>
      <Button href="/contact" variant="secondary">
        Enquire
      </Button>
      {msg ? (
        <p className="w-full text-sm text-ink-muted" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
