import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace Node.js modules with empty objects
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        // Add any other Node.js modules you need to polyfill
        // path: false,
        // crypto: false,
      };
    }
    return config;
  }
};

export default nextConfig;
