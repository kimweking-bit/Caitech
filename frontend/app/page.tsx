import type { Metadata } from "next";
import { HomeHero } from "@/components/hero/HomeHero";
import { ProofStrip } from "@/components/home/ProofStrip";
import { Positioning } from "@/components/home/Positioning";
import { SchoolsExplorer } from "@/components/home/SchoolsExplorer";
import { FeaturedProgrammes } from "@/components/home/FeaturedProgrammes";
import { WhyCaitech } from "@/components/home/WhyCaitech";
import { ToolsStrip } from "@/components/home/ToolsStrip";
import { Outcomes } from "@/components/home/Outcomes";
import { AiPathTeaser } from "@/components/home/AiPathTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { NairobiLocation } from "@/components/home/NairobiLocation";
import { BlogEditorial } from "@/components/home/BlogEditorial";
import { FinalCta } from "@/components/home/FinalCta";
import { site } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} · Technical skill for work that ships`,
  },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ProofStrip />
      <Positioning />
      <SchoolsExplorer />
      <FeaturedProgrammes />
      <WhyCaitech />
      <ToolsStrip />
      <Outcomes />
      <AiPathTeaser />
      <Testimonials />
      <NairobiLocation />
      <BlogEditorial />
      <FinalCta />
    </>
  );
}
