import { apiFetch } from "@/lib/api/client";
import type { CourseListItem, PaginatedResponse } from "@/types/api";

/** Courses assigned to the authenticated instructor. */
export async function getInstructorCourses(
  page = 1,
): Promise<PaginatedResponse<CourseListItem>> {
  const q = page > 1 ? `?page=${page}` : "";
  return apiFetch<PaginatedResponse<CourseListItem>>(`/instructor/courses/${q}`, {
    auth: true,
    cache: "no-store",
  });
}
