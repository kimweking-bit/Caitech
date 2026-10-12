import type { AuthUser } from "@/types/api";

export type PortalRole = "student" | "instructor" | "admin";

/** Strict portal selection — staff is never treated as instructor. */
export function primaryPortal(user: AuthUser | null | undefined): PortalRole {
  if (!user) return "student";
  if (user.is_staff) return "admin";
  if (user.is_instructor || user.is_verified_instructor) return "instructor";
  return "student";
}

export function portalHome(user: AuthUser | null | undefined): string {
  const role = primaryPortal(user);
  if (role === "admin") return "/admin";
  if (role === "instructor") return "/instructor";
  return "/student";
}

/** True only for institutional staff (admin portal). */
export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.is_staff);
}

/**
 * Teaching workspace access.
 * Staff/admin must NOT inherit instructor portal via is_staff.
 */
export function isInstructorUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_staff) return false;
  return Boolean(user.is_instructor || user.is_verified_instructor);
}

/** Learning portal — not staff and not instructor. */
export function isStudentUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_staff) return false;
  if (user.is_instructor || user.is_verified_instructor) return false;
  return user.is_student !== false;
}

export function canAccessPortal(
  user: AuthUser | null | undefined,
  role: PortalRole,
): boolean {
  if (!user) return false;
  if (role === "admin") return isAdminUser(user);
  if (role === "instructor") return isInstructorUser(user);
  return isStudentUser(user);
}
