export type PortalNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  /** Optional group label for admin dense nav */
  group?: string;
};

export type PortalKind = "student" | "instructor" | "admin";

export type PortalTheme = {
  kind: PortalKind;
  /** Short product label shown in chrome */
  productLabel: string;
  /** Accent stripe / focus color class tokens */
  accentClass: string;
  sidebarClass: string;
  topBarClass: string;
  navActiveClass: string;
  navIdleClass: string;
  badgeClass: string;
};
