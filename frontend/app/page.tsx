import type { Metadata } from "next";
import { HomeHero } from "@/components/hero/HomeHero";
import { ProofStrip } from "@/components/home/ProofStrip";
import { CategoryDiscovery } from "@/components/home/CategoryDiscovery";
import { FeaturedProgrammes } from "@/components/home/FeaturedProgrammes";
import { WhyCaitech } from "@/components/home/WhyCaitech";
import { Outcomes } from "@/components/home/Outcomes";
import { ToolsStrip } from "@/components/home/ToolsStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { NairobiLocation } from "@/components/home/NairobiLocation";
import { BlogEditorial } from "@/components/home/BlogEditorial";
import { FinalCta } from "@/components/home/FinalCta";
import { site } from "@/lib/content/stub-copy";

export const metadata: Metadata = {
  title: site.name,
  description: site.tagline,
};

/**
 * Homepage — photography-led hero + official 8-category discovery.
 * SchoolsExplorer (6-school rail) removed to avoid taxonomy mismatch.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ProofStrip />
      <CategoryDiscovery />
      <FeaturedProgrammes />
      <WhyCaitech />
      <Outcomes />
      <ToolsStrip />
      <Testimonials />
      <NairobiLocation />
      <BlogEditorial />
      <FinalCta />
    </>
  );
}
