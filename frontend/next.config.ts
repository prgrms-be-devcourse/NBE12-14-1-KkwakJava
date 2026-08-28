import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/",
        destination:"/order",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/admin/delivery",
        permanent: false
      },
    ];
  },
};

export default nextConfig;
