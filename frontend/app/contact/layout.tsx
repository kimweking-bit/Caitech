import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact CAITECH Global Institute — KTDA Plaza, Moi Avenue, Nairobi CBD. Admissions and programme enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
