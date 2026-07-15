import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
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
