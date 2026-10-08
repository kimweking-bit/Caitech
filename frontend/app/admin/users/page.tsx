"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listAdminUsers } from "@/lib/api/admin-ops";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(q = "") {
    setLoading(true);
    setError(null);
    try {
      setUsers(asList(await listAdminUsers(1, q)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <form
        className="mb-6 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(search);
        }}
      >
        <div className="min-w-[12rem] flex-1">
          <Input id="q" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol" role="alert">{error}</p> : null}
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line bg-surface font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line">
                <td className="px-3 py-2 text-petrol">{u.username}</td>
                <td className="px-3 py-2 text-ink-muted">{u.email}</td>
                <td className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {[u.is_staff && "staff", u.is_instructor && "instructor", u.is_student && "student"]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-ink-muted">No users.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
