import type { AuthUser } from "@/types/api";

export type PortalRole = "student" | "instructor" | "admin";

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
