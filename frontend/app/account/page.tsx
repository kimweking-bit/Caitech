"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getStudentDashboard } from "@/lib/api/lms";
import { ApiError } from "@/lib/api/client";
import { mediaUrl } from "@/lib/utils/format";
import { displayTitle } from "@/lib/utils/display";
import type { DashboardEnrollment } from "@/types/api";
import Image from "next/image";

function AccountHome() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<DashboardEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dash = await getStudentDashboard();
        if (!cancelled) setCourses(dash.my_courses || []);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Could not load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container className="py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        Account
      </p>
      <h1 className="mt-3 font-display text-3xl text-petrol md:text-4xl">
        {user?.first_name
          ? `Hello, ${user.first_name}`
          : user?.username
            ? `Hello, ${user.username}`
            : "Your account"}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{user?.email}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/account/orders" variant="secondary">
          Orders
        </Button>
        {user?.is_instructor || user?.is_verified_instructor ? (
          <Button href="/instructor" variant="secondary">
            Instructor
          </Button>
        ) : null}
        {user?.is_staff ? (
          <Button href="/admin" variant="secondary">
            Admin
          </Button>
        ) : null}
        <Button href="/courses" variant="ghost">
          Catalogue
        </Button>
      </div>

      <section className="mt-12" aria-labelledby="my-courses">
        <h2 id="my-courses" className="font-display text-2xl text-petrol">
          My courses
        </h2>

        {loading ? (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Loading enrolments…
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 text-sm text-petrol" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && courses.length === 0 ? (
          <div className="mt-8 border border-line bg-surface px-6 py-12 text-center">
            <p className="font-display text-xl text-petrol">No enrolments yet</p>
            <p className="mt-2 text-sm text-ink-muted">
              Purchase a programme or complete free checkout to start learning.
            </p>
            <div className="mt-6">
              <Button href="/courses" variant="lime">
                Browse courses
              </Button>
            </div>
          </div>
        ) : null}

        {courses.length > 0 ? (
          <ul className="mt-8 list-none space-y-0 divide-y divide-line border border-line p-0">
            {courses.map((c) => {
              const img = mediaUrl(c.course_image);
              return (
                <li key={c.id}>
                  <Link
                    href={`/learn/${c.course_slug}?enrollment=${c.id}`}
                    className="flex flex-col gap-4 p-4 no-underline sm:flex-row sm:items-center"
                  >
                    <div className="relative h-20 w-full shrink-0 overflow-hidden bg-petrol/5 sm:w-28">
                      {img ? (
                        <Image src={img} alt="" fill className="object-cover" sizes="112px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg text-petrol">{displayTitle(c.course_title)}</p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                        {c.completed
                          ? "Completed"
                          : `${c.completed_lessons}/${c.total_lessons} lessons · ${c.progress_percentage}%`}
                      </p>
                      <div className="mt-2 h-1 w-full max-w-xs bg-line">
                        <div
                          className="h-full bg-lime"
                          style={{ width: `${Math.min(100, Number(c.progress_percentage) || 0)}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-petrol">
                      Continue →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </Container>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountHome />
    </RequireAuth>
  );
}
