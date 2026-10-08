import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { getBlogPosts } from "@/lib/api/content";
import { getCourses } from "@/lib/api/courses";

const base = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/courses",
    "/blog",
    "/about",
    "/contact",
    "/ai-path",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  let courseUrls: MetadataRoute.Sitemap = [];
  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const courses = await getCourses({ page: 1 });
    courseUrls = courses.results.map((c) => ({
      url: `${base}/courses/${c.slug}`,
      lastModified: c.created_at ? new Date(c.created_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    /* omit dynamic if API down */
  }

  try {
    const posts = await getBlogPosts({ page: 1 });
    blogUrls = posts.results.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    /* omit */
  }

  return [...staticRoutes, ...courseUrls, ...blogUrls];
}
