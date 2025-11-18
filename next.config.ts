import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [new URL("https://thuthuatnhanh.com/**")],
  },
  allowedDevOrigins: ["http://192.168.1.231:3000", "ws://192.168.1.231:3000"],
};

export default nextConfig;
