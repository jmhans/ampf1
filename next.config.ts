import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
      },
      {
        protocol: 'https',
        hostname: 'www.formula1.com',
      },
    ],
  },
};

export default nextConfig;
