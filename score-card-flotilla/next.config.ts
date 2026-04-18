import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // @ts-ignore - Turbopack root config
  turbopack: {
    root: "./",
  },
};

export default nextConfig;
