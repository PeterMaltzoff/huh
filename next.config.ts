import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['reactflow'],
};

export default nextConfig;
