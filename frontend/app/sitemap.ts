import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

const staticRoutes = [
  "/",
  "/courses",
  "/about",
  "/ai-path",
  "/blog",
  "/contact",
  "/faq",
  "/login",
  "/register",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return staticRoutes.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/courses" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/courses" ? 0.9 : 0.6,
  }));
}
