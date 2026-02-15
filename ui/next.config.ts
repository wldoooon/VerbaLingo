import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone mode creates a self-contained server.js that includes
  // only the necessary dependencies — perfect for Docker deployments
  output: "standalone",
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
