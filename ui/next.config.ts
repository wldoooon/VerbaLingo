import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // Removed because it causes EPERM symlink errors on Windows locally and is not needed for Vercel
  async rewrites() {
    const backendBase = process.env.BACKEND_URL ?? "http://127.0.0.1:5001";
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
