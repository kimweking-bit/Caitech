import type { NavItem } from "@/types/nav";

/** Primary chrome — exact client order */
export const primaryNav: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses", coursesMenu: true },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const utilityNav: readonly NavItem[] = [
  { label: "Log in", href: "/login" },
  { label: "Register", href: "/register", emphasis: "primary" },
] as const;

export const footerNav = {
  learn: [
    { label: "Courses", href: "/courses" },
    { label: "Services", href: "/services" },
    { label: "Learning areas", href: "/#learning-areas" },
    { label: "AI Learning Path", href: "/ai-path" },
  ],
  institute: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ],
  account: [
    { label: "Log in", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Cart", href: "/cart" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

/** Catalogue filter URL for a category slug (existing app mechanism). */
export function coursesCategoryHref(slug: string): string {
  const s = slug.trim();
  if (!s) return "/courses";
  return `/courses?category=${encodeURIComponent(s)}`;
}
