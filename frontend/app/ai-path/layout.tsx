import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Learning Path",
  description:
    "Map your goals to CAITECH technical programmes with a short learning-path questionnaire.",
  alternates: { canonical: "/ai-path" },
};

export default function AiPathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
