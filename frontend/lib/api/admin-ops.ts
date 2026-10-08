import { apiFetch } from "@/lib/api/client";
import type {
  AdminUser,
  BlogPost,
  ContactInquiry,
  NotificationEvent,
  PaginatedResponse,
} from "@/types/api";

export function asList<T>(data: T[] | PaginatedResponse<T> | undefined | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function listAdminUsers(page = 1, search = "") {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  if (search.trim()) sp.set("search", search.trim());
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiFetch<PaginatedResponse<AdminUser> | AdminUser[]>(
    `/auth/admin/users/${q}`,
    { auth: true, cache: "no-store" },
  );
}

export async function listInquiries(page = 1) {
  const q = page > 1 ? `?page=${page}` : "";
  return apiFetch<PaginatedResponse<ContactInquiry> | ContactInquiry[]>(
    `/contact/inquiries/${q}`,
    { auth: true, cache: "no-store" },
  );
}

export async function listNotifications(page = 1) {
  const q = page > 1 ? `?page=${page}` : "";
  return apiFetch<PaginatedResponse<NotificationEvent> | NotificationEvent[]>(
    `/auth/admin/notifications/${q}`,
    { auth: true, cache: "no-store" },
  );
}

export async function listStaffPosts(page = 1) {
  const q = page > 1 ? `?page=${page}` : "";
  return apiFetch<PaginatedResponse<BlogPost> | BlogPost[]>(
    `/blog/posts/${q}`,
    { auth: true, cache: "no-store" },
  );
}

export async function createStaffPost(payload: {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  status?: string;
}): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/blog/posts/`, {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function updateStaffPost(
  slug: string,
  payload: Partial<{ title: string; excerpt: string; body: string; status: string }>,
): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    auth: true,
  });
}
