import { apiFetch, ApiError } from "@/lib/api/client";
import type {
  BlogPost,
  ContactAccepted,
  ContactPayload,
  NewsletterSubscribe,
  PaginatedResponse,
} from "@/types/api";

export type BlogListParams = {
  page?: number;
  search?: string;
};

function qs(params?: BlogListParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.search?.trim()) sp.set("search", params.search.trim());
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function getBlogPosts(
  params?: BlogListParams,
): Promise<PaginatedResponse<BlogPost>> {
  return apiFetch<PaginatedResponse<BlogPost>>(`/blog/posts/${qs(params)}`, {
    next: { revalidate: 60, tags: ["blog"] },
  });
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiFetch<BlogPost>(
      `/blog/posts/${encodeURIComponent(slug)}/`,
      { next: { revalidate: 60, tags: ["blog", `post-${slug}`] } },
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getRecentPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const page = await getBlogPosts({ page: 1 });
    return page.results.slice(0, limit);
  } catch {
    return [];
  }
}

export async function subscribeNewsletter(
  email: string,
): Promise<{ email?: string; detail?: string }> {
  return apiFetch("/newsletter/subscribe/", {
    method: "POST",
    body: JSON.stringify({ email } satisfies NewsletterSubscribe),
    auth: false,
  });
}

export async function submitContact(
  payload: ContactPayload,
): Promise<ContactAccepted> {
  return apiFetch<ContactAccepted>("/contact/", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}
