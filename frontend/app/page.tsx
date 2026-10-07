import type { Metadata } from "next";
import { HomeHero } from "@/components/hero/HomeHero";
import { Positioning } from "@/components/home/Positioning";
import { SchoolsGrid } from "@/components/home/SchoolsGrid";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { WhyCaitech } from "@/components/home/WhyCaitech";
import { PracticalLearning } from "@/components/home/PracticalLearning";
import { AiPathTeaser } from "@/components/home/AiPathTeaser";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { FinalCta } from "@/components/home/FinalCta";
import { site } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} · Technical skill for work that ships`,
  },
  description: site.description,
  alternates: { canonical: "/" },
};

/**
 * Homepage is a Server Component tree.
 * FeaturedCourses is the only section that hits the API (with empty fallback).
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Positioning />
      <SchoolsGrid />
      <FeaturedCourses />
      <WhyCaitech />
      <PracticalLearning />
      <AiPathTeaser />
      <BlogTeaser />
      <FinalCta />
    </>
  );
}
