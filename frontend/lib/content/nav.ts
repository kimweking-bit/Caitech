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
    { label: "Learning areas", href: "/#learning-areas" },
    { label: "AI Learning Path", href: "/ai-path" },
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
