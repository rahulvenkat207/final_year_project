import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for performance
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Reduce build time
  typescript: {
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
