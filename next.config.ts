import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate browser-test compilation from a developer's running server.
  distDir: process.env.HISAB_QA_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-DNS-Prefetch-Control", value: "off" }, { key: "X-Permitted-Cross-Domain-Policies", value: "none" }] }];
  },
};

export default nextConfig;
