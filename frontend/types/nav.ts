export type NavItem = {
  label: string;
  href: string;
  emphasis?: "primary" | "default";
  external?: boolean;
  /**
   * When true, desktop/mobile chrome render a Courses disclosure
   * fed by live category data (not hardcoded children).
   */
  coursesMenu?: boolean;
};

/** Minimal category shape for nav mega-menu (from API). */
export type NavCategory = {
  id: number;
  name: string;
  slug: string;
};
