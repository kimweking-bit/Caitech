import type { NavItem } from "@/types/nav";

export const primaryNav: readonly NavItem[] = [
  { label: "Courses", href: "/courses" },
  { label: "AI Path", href: "/ai-path" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const utilityNav: readonly NavItem[] = [
  { label: "Log in", href: "/login" },
  { label: "Register", href: "/register", emphasis: "primary" },
] as const;

export const footerNav = {
  learn: [
    { label: "Courses", href: "/courses" },
    { label: "Categories", href: "/courses" },
    { label: "AI Learning Path", href: "/ai-path" },
    { label: "FAQ", href: "/faq" },
  ],
  institute: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
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

/**
 * Footer contact — null means DO NOT RENDER that row.
 * Never ship placeholder emails, phones, or social URLs.
 */
export const footerContact = {
  email: null as string | null,
  phone: null as string | null,
  /** City/country only until a real address is approved. */
  locationLine: "Kenya" as string | null,
};
