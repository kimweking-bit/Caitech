import { apiFetch } from "@/lib/api/client";
import type {
  AdminEnrollment,
  Assignment,
  AssignmentSubmission,
  CourseLesson,
  CourseResource,
  CourseReview,
  CourseSection,
  EnrollmentProgress,
  PaginatedResponse,
  Quiz,
  QuizAttempt,
  StudentDashboard,
} from "@/types/api";

export function asList<T>(data: T[] | PaginatedResponse<T> | undefined | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function getStudentDashboard(page = 1): Promise<StudentDashboard> {
  const q = page > 1 ? `?page=${page}` : "";
  return apiFetch<StudentDashboard>(`/courses/dashboard/${q}`, {
    auth: true,
    cache: "no-store",
  });
}

export async function getEnrollmentProgress(
  enrollmentId: number,
): Promise<EnrollmentProgress> {
  return apiFetch<EnrollmentProgress>(
    `/courses/enrollments/${enrollmentId}/progress/`,
    { auth: true, cache: "no-store" },
  );
}

export async function markLessonProgress(
  enrollmentId: number,
  lesson: number,
  completed = true,
) {
  return apiFetch(`/courses/enrollments/${enrollmentId}/progress/`, {
    method: "POST",
    body: JSON.stringify({ lesson, completed }),
    auth: true,
  });
}

export async function getCourseSections(courseId: number) {
  return apiFetch<CourseSection[] | PaginatedResponse<CourseSection>>(
    `/courses/${courseId}/sections/`,
    { auth: true, cache: "no-store" },
  );
}

export async function getSectionLessons(sectionId: number) {
  return apiFetch<CourseLesson[] | PaginatedResponse<CourseLesson>>(
    `/courses/sections/${sectionId}/lessons/`,
    { auth: true, cache: "no-store" },
  );
}

export async function getLesson(lessonId: number): Promise<CourseLesson> {
  return apiFetch<CourseLesson>(`/courses/lessons/${lessonId}/`, {
    auth: true,
    cache: "no-store",
  });
}

export async function getCourseResources(courseId: number) {
  return apiFetch<CourseResource[] | PaginatedResponse<CourseResource>>(
    `/courses/${courseId}/resources/`,
    { auth: true, cache: "no-store" },
  );
}

export function resourceDownloadPath(resourceId: number): string {
  let base = process.env.NEXT_PUBLIC_API_URL || "";
  if (base.endsWith("/")) base = base.slice(0, -1);
  return base + "/courses/resources/" + resourceId + "/download/";
}

export async function getCourseQuizzes(courseId: number) {
  return apiFetch<Quiz[] | PaginatedResponse<Quiz>>(
    `/courses/${courseId}/quizzes/`,
    { auth: true, cache: "no-store" },
  );
}

export async function getQuiz(quizId: number): Promise<Quiz> {
  return apiFetch<Quiz>(`/courses/quizzes/${quizId}/`, {
    auth: true,
    cache: "no-store",
  });
}

export async function listQuizAttempts(quizId: number) {
  return apiFetch<QuizAttempt[] | PaginatedResponse<QuizAttempt>>(
    `/courses/quizzes/${quizId}/attempts/`,
    { auth: true, cache: "no-store" },
  );
}

export async function submitQuizAttempt(
  quizId: number,
  answers: { question: number; choices: number[] }[],
): Promise<QuizAttempt> {
  return apiFetch<QuizAttempt>(`/courses/quizzes/${quizId}/attempts/`, {
    method: "POST",
    body: JSON.stringify({ answers }),
    auth: true,
  });
}

export async function getCourseAssignments(courseId: number) {
  return apiFetch<Assignment[] | PaginatedResponse<Assignment>>(
    `/courses/${courseId}/assignments/`,
    { auth: true, cache: "no-store" },
  );
}

export async function getAssignment(assignmentId: number): Promise<Assignment> {
  return apiFetch<Assignment>(`/courses/assignments/${assignmentId}/`, {
    auth: true,
    cache: "no-store",
  });
}

export async function listSubmissions(assignmentId: number) {
  return apiFetch<
    AssignmentSubmission[] | PaginatedResponse<AssignmentSubmission>
  >(`/courses/assignments/${assignmentId}/submissions/`, {
    auth: true,
    cache: "no-store",
  });
}

export async function submitAssignment(
  assignmentId: number,
  content: string,
): Promise<AssignmentSubmission> {
  return apiFetch<AssignmentSubmission>(
    `/courses/assignments/${assignmentId}/submissions/`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
      auth: true,
    },
  );
}

export async function gradeSubmission(
  submissionId: number,
  grade: string | number,
  feedback: string,
): Promise<AssignmentSubmission> {
  return apiFetch<AssignmentSubmission>(
    `/courses/submissions/${submissionId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({ grade, feedback }),
      auth: true,
    },
  );
}

export async function listCourseReviews(courseSlug: string) {
  return apiFetch<CourseReview[] | PaginatedResponse<CourseReview>>(
    `/courses/${encodeURIComponent(courseSlug)}/reviews/`,
    { auth: false, cache: "no-store" },
  );
}

export async function submitCourseReview(
  courseSlug: string,
  rating: number,
  comment: string,
): Promise<CourseReview> {
  return apiFetch<CourseReview>(
    `/courses/${encodeURIComponent(courseSlug)}/reviews/`,
    {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
      auth: true,
    },
  );
}

export async function listAdminEnrollments(page = 1, search = "") {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  if (search.trim()) sp.set("search", search.trim());
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiFetch<PaginatedResponse<AdminEnrollment> | AdminEnrollment[]>(
    `/courses/admin/enrollments/${q}`,
    { auth: true, cache: "no-store" },
  );
}

export async function manualEnroll(payload: {
  student: number;
  course: number;
  note?: string;
}): Promise<AdminEnrollment> {
  return apiFetch<AdminEnrollment>(`/courses/admin/manual-enrol/`, {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function getEnrollmentReport(page = 1) {
  const q = page > 1 ? `?page=${page}` : "";
  return apiFetch(`/courses/admin/reports/enrollments/${q}`, {
    auth: true,
    cache: "no-store",
  });
}


