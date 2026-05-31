import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Google Cloud Run: produces a self-contained Node.js server
  // bundle in .next/standalone — keeps the Docker image small and fast to start.
  output: "standalone",
};

export default nextConfig;
