/**
 * Compatibility re-export.
 * Prefer importing from `@/lib/portal/roles` in new code.
 */
export {
  canAccessPortal,
  isAdminUser,
  isInstructorUser,
  isStudentUser,
  portalHome,
  primaryPortal,
  type PortalRole,
} from "@/lib/portal/roles";
