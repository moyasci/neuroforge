import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    // pdfjs-dist worker support (for webpack fallback)
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
