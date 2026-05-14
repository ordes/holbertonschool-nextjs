import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, net: false, tls: false,
        path: false, zlib: false, stream: false,
        util: false, buffer: false, crypto: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        mysql2: false,
        bcryptjs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
