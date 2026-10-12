import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not advertise the framework stack on HTTP responses.
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        type: "css",
      },
    },
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2200, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
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
