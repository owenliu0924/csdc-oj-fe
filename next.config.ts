import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Images binding optional; unoptimized avoids sharp in Worker
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
  // Keep heavy / Node-only packages out of the server graph where possible
  serverExternalPackages: [
    "echarts",
    "echarts-for-react",
    "zrender",
    "highlight.js",
    "katex",
    "dompurify",
    "@uiw/react-codemirror",
    "@codemirror/view",
    "@codemirror/state",
    "@codemirror/language",
    "@tiptap/core",
    "@tiptap/pm",
    "@tiptap/react",
  ],
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

// Enable Cloudflare bindings during `next dev` (no-op outside CF tooling)
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
