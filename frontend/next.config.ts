import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        type: "css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.caitech.co.ke",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Phase 1 spike: keep false until catalog fetch + shell verified under PPR.
  // Revisit when FeaturedCourses + auth boundaries are stable.
  cacheComponents: false,
};

export default nextConfig;
