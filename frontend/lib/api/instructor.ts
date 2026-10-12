import { apiFetch } from "@/lib/api/client";
import type {
  AdminEnrollment,
  CourseListItem,
  PaginatedResponse,
} from "@/types/api";

export type InstructorOverview = {
  assigned_courses: number;
  total_students: number;
  total_enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
  pending_submissions: number;
  reviews_count: number;
  average_rating: number | null;
  total_lessons: number;
};

/** Courses assigned to the authenticated instructor. */
export async function getInstructorCourses(
  page = 1,
): Promise<PaginatedResponse<CourseListItem>> {
  const path =
    page > 1 ? `/instructor/courses/?page=${page}` : "/instructor/courses/";
  return apiFetch<PaginatedResponse<CourseListItem>>(path, {
    auth: true,
    cache: "no-store",
  });
}

export async function getInstructorOverview(): Promise<InstructorOverview> {
  return apiFetch<InstructorOverview>("/instructor/overview/", {
    auth: true,
    cache: "no-store",
  });
}

export async function getInstructorStudents(
  pageOrOpts: number | { page?: number; search?: string; course?: number } = 1,
  search = "",
): Promise<PaginatedResponse<AdminEnrollment>> {
  const page =
    typeof pageOrOpts === "number" ? pageOrOpts : pageOrOpts.page || 1;
  const qSearch =
    typeof pageOrOpts === "number" ? search : pageOrOpts.search || "";
  const course =
    typeof pageOrOpts === "number" ? undefined : pageOrOpts.course;
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (qSearch.trim()) params.set("search", qSearch.trim());
  if (course) params.set("course", String(course));
  const q = params.toString();
  return apiFetch<PaginatedResponse<AdminEnrollment>>(
    `/instructor/students/${q ? `?${q}` : ""}`,
    { auth: true, cache: "no-store" },
  );
}
