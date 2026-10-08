import { apiFetch } from "@/lib/api/client";
import type { CourseListItem, PaginatedResponse } from "@/types/api";

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
