import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for the Cloud Run container; Vercel builds ignore this variable.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
};

export default nextConfig;
