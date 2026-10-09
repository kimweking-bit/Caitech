"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, listAdminBlogPosts } from "@/lib/api/admin-ops";
import type { BlogPost } from "@/types/api";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable, Td } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { LoadingBlock } from "@/components/portal/LoadingBlock";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/Button";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await listAdminBlogPosts(1);
        if (!c) setPosts(asList(data));
      } catch (e) {
        if (!c)
          setError(
            e instanceof ApiError ? e.message : "Could not load blog posts.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Posts from the content API."
        actions={
          <Button href="/blog" variant="secondary">
            Public blog
          </Button>
        }
      />
      {loading ? <LoadingBlock /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && posts.length === 0 ? (
        <EmptyState
          title="No posts"
          description="Create posts in Django admin or via the content API."
        />
      ) : null}
      {posts.length > 0 ? (
        <DataTable headers={["Title", "Status", "Published", "Actions"]}>
          {posts.map((p) => (
            <tr key={p.id}>
              <Td>
                <p className="text-sm text-petrol">{p.title}</p>
                <p className="font-mono text-[11px] text-ink-muted">{p.slug}</p>
              </Td>
              <Td>
                <StatusBadge
                  tone={
                    String(p.status).toLowerCase().includes("publish")
                      ? "success"
                      : "neutral"
                  }
                >
                  {p.status || "—"}
                </StatusBadge>
              </Td>
              <Td className="font-mono text-xs text-ink-muted">
                {p.published_at
                  ? new Date(p.published_at).toLocaleDateString()
                  : "—"}
              </Td>
              <Td>
                <Button href={`/blog/${p.slug}`} variant="secondary">
                  View
                </Button>
              </Td>
            </tr>
          ))}
        </DataTable>
      ) : null}
    </div>
  );
}
