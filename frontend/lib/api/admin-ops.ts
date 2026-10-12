import { apiFetch } from "@/lib/api/client";
import type {
  AdminUser,
  BlogPost,
  ContactInquiry,
  NotificationEvent,
  PaginatedResponse,
} from "@/types/api";

export function asListAdmin<T>(
  data: PaginatedResponse<T> | T[] | undefined | null,
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

/** Alias used by existing admin pages */
export const asList = asListAdmin;

export type InstructorApplication = {
  id: number;
  user?: number;
  username?: string;
  email?: string;
  status: string;
  message?: string;
  motivation?: string;
  created_at?: string;
  reviewed_at?: string | null;
  [key: string]: unknown;
};

export type NewsletterSubscription = {
  id: number;
  email: string;
  created_at?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

function pageQuery(page?: number, search?: string) {
  const sp = new URLSearchParams();
  if (page && page > 1) sp.set("page", String(page));
  if (search?.trim()) sp.set("search", search.trim());
  const q = sp.toString();
  return q ? `?${q}` : "";
}

/** Supports listAdminUsers(1) and listAdminUsers({ page, search }) */
export async function listAdminUsers(
  pageOrParams: number | { page?: number; search?: string } = 1,
  search?: string,
): Promise<PaginatedResponse<AdminUser> | AdminUser[]> {
  const params =
    typeof pageOrParams === "number"
      ? { page: pageOrParams, search }
      : pageOrParams || {};
  return apiFetch(`/auth/admin/users/${pageQuery(params.page, params.search)}`, {
    auth: true,
    cache: "no-store",
  });
}

export async function listAdminInstructors(
  page = 1,
): Promise<PaginatedResponse<AdminUser> | AdminUser[]> {
  return apiFetch(`/auth/admin/instructors/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}

export async function listInstructorApplications(
  page = 1,
): Promise<PaginatedResponse<InstructorApplication> | InstructorApplication[]> {
  return apiFetch(`/auth/instructor/requests/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}

export async function reviewInstructorApplication(
  id: number,
  approved: boolean,
): Promise<unknown> {
  return apiFetch(`/auth/instructor/requests/${id}/review/`, {
    method: "POST",
    body: JSON.stringify({ approved }),
    auth: true,
  });
}

export async function listContactInquiries(
  page = 1,
): Promise<PaginatedResponse<ContactInquiry> | ContactInquiry[]> {
  return apiFetch(`/content/contact/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}

/** Back-compat */
export const listInquiries = listContactInquiries;

export async function listAdminNotifications(
  page = 1,
): Promise<PaginatedResponse<NotificationEvent> | NotificationEvent[]> {
  return apiFetch(`/auth/admin/notifications/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}

/** Back-compat */
export const listNotifications = listAdminNotifications;


export async function listMyNotifications(
  page = 1,
): Promise<PaginatedResponse<NotificationEvent> | NotificationEvent[]> {
  return apiFetch(`/auth/me/notifications/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}

export async function listAdminBlogPosts(
  page = 1,
): Promise<PaginatedResponse<BlogPost> | BlogPost[]> {
  return apiFetch(`/content/blog/posts/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}

export async function listNewsletterSubscriptions(
  page = 1,
): Promise<
  PaginatedResponse<NewsletterSubscription> | NewsletterSubscription[]
> {
  return apiFetch(`/content/newsletter/subscribers/${pageQuery(page)}`, {
    auth: true,
    cache: "no-store",
  });
}
