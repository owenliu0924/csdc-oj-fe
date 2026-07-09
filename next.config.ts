import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const backend = process.env.OJ_BACKEND_URL || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/public/:path*",
        destination: `${backend}/public/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
  // Keep heavy chart libs out of the OpenNext/Cloudflare Worker server bundle
  serverExternalPackages: ["echarts", "echarts-for-react", "zrender"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "echarts/core",
      "echarts/charts",
      "echarts/components",
      "echarts/renderers",
    ],
  },
};

export default withNextIntl(nextConfig);
