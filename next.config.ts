import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Temporarily disable ESLint during production build
  },
};

export default nextConfig;
