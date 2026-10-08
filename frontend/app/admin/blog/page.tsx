"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { asList, createStaffPost, listStaffPosts, updateStaffPost } from "@/lib/api/admin-ops";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { BlogPost } from "@/types/api";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function load() { setLoading(true); try { setPosts(asList(await listStaffPosts(1))); } catch(e){ setError(e instanceof ApiError?e.message:"Could not load posts."); } finally { setLoading(false);} }
  useEffect(() => { void load(); }, []);
  async function onCreate(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      await createStaffPost({ title: title.trim(), slug: slug.trim(), body: body.trim(), status: "draft" });
      setMsg("Draft created."); setTitle(""); setSlug(""); setBody(""); await load();
    } catch(err){ setMsg(err instanceof ApiError?err.message:"Create failed."); }
    finally { setBusy(false); }
  }
  async function publish(p: BlogPost) {
    setBusy(true);
    try { await updateStaffPost(p.slug, { status: "published" }); setMsg("Published " + p.slug); await load(); }
    catch(err){ setMsg(err instanceof ApiError?err.message:"Publish failed."); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-10">
      <form onSubmit={onCreate} className="max-w-xl space-y-4 border border-line p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">New post</p>
        <Input id="t" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={busy} />
        <Input id="s" label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={busy} />
        <Textarea id="b" label="Body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} required disabled={busy} />
        <Button type="submit" variant="lime" disabled={busy}>{busy ? "Saving…" : "Create draft"}</Button>
        {msg ? <p className="text-sm text-ink-muted">{msg}</p> : null}
      </form>
      {loading ? <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-petrol">{error}</p> : null}
      <ul className="list-none divide-y divide-line border border-line p-0">
        {posts.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div><p className="text-sm text-petrol">{p.title}</p>
              <p className="font-mono text-[11px] uppercase text-ink-muted">{p.slug} · {p.status}</p></div>
            {p.status !== "published" ? <Button type="button" variant="secondary" disabled={busy} onClick={() => void publish(p)}>Publish</Button> : null}
          </li>
        ))}
        {!loading && posts.length === 0 ? <li className="px-4 py-8 text-center text-ink-muted">No posts.</li> : null}
      </ul>
    </div>
  );
}
