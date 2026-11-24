import type { NextConfig } from "next";
import siteConfig from "./cloudea.config";

/** Local files referenced from cloudea.config.ts that are read at runtime. */
const configFiles = [
  ...(siteConfig.customCss ?? []),
  ...(siteConfig.customScripts ?? []).filter((s) => s.src && !s.external).map((s) => s.src!),
].map((file) => `./${file.replace(/^\.?\//, "")}`);

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Content is read from disk at request time; make sure it ships with the standalone build.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", ...configFiles],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
