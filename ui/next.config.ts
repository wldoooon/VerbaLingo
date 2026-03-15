import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites removed — frontend now calls api.pokispokey.com directly.
  // This eliminates the Vercel → VPS proxy hop that was causing ~2-3s latency.
};

export default nextConfig;
