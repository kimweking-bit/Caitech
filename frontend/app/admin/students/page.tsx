"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listAdminUsers } from "@/lib/api/admin-ops";
import type { AdminUser } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listAdminUsers({ page: 1, search: q });
        const list = asList(data).filter(
          (u) => u.is_student || (!u.is_staff && !u.is_instructor),
        );
        // If filter empties the page, still show full admin user list for ops
        const show = list.length ? list : asList(data);
        if (!c) {
          setRows(show);
          setCount(
            typeof data === "object" && data && "count" in data
              ? Number((data as { count: number }).count)
              : show.length,
          );
        }
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load students.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [q]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setQ(search.trim());
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People"
        title="Students & users"
        description="Search accounts from the admin users API."
      />
      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1">
          <Input
            id="admin-user-search"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Username or email"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState title="No users found" description="Try another search." />
      ) : null}
      {rows.length > 0 ? (
        <>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Showing {rows.length}
            {count ? ` · API count ${count}` : ""}
          </p>
          <DataTable
            headers={["User", "Email", "Flags", "Joined"]}
          >
            {rows.map((u) => (
              <tr key={u.id}>
                <Td>
                  <p className="text-sm text-petrol">{u.username}</p>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") ||
                      "—"}
                  </p>
                </Td>
                <Td className="font-mono text-xs">{u.email}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {u.is_student ? (
                      <StatusBadge tone="info">Student</StatusBadge>
                    ) : null}
                    {u.is_instructor || u.is_verified_instructor ? (
                      <StatusBadge tone="success">Instructor</StatusBadge>
                    ) : null}
                    {u.is_staff ? (
                      <StatusBadge tone="warning">Staff</StatusBadge>
                    ) : null}
                    {!u.is_active ? (
                      <StatusBadge tone="danger">Inactive</StatusBadge>
                    ) : null}
                  </div>
                </Td>
                <Td className="font-mono text-xs text-ink-muted">
                  {u.date_joined
                    ? new Date(u.date_joined).toLocaleDateString()
                    : "—"}
                </Td>
              </tr>
            ))}
          </DataTable>
        </>
      ) : null}
    </div>
  );
}
