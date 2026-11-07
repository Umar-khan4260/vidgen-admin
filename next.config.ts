import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker builds set NEXT_OUTPUT_STANDALONE=1 to emit `.next/standalone`
  // (a self-contained server without node_modules) for a small runtime image.
  // Normal local/host deployments keep the default so `next start` still works.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  // Hide the Next.js dev-tools indicator badge (bottom-left corner).
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
