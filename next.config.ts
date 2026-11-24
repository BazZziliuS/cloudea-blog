import type { NextConfig } from "next";
import siteConfig from "./cloudea.config";

/** Local files referenced from cloudea.config.ts that are read at runtime. */
const configFiles = [
  ...(siteConfig.customCss ?? []),
  ...(siteConfig.customScripts ?? []).filter((s) => s.src && !s.external).map((s) => s.src!),
].map((file) => `./${file.replace(/^\.?\//, "")}`);

/** Portfolio pages moved from the wiki to /projects (old URL → new URL). */
const MOVED_PAGES: [string, string][] = [
  ["/docs/bots/orders/auroralands", "/projects/auroralands"],
  ["/docs/bots/orders/melonland", "/projects/melonland"],
  ["/docs/bots/orders/velyashop", "/projects/velyashop"],
  ["/docs/bots/orders/vk-discord-repost", "/projects/vk-discord-repost"],
  ["/docs/bots/personal/autoshop", "/projects/autoshop"],
  ["/docs/bots/personal/baseshop", "/projects/baseshop"],
  ["/docs/bots/personal/centurybot", "/projects/centurybot"],
  ["/docs/bots/personal/mystic-bot", "/projects/mystic-bot"],
  ["/docs/bots/personal/rustybot", "/projects/rustybot"],
  ["/docs/bots/personal/teleunpackbot", "/projects/teleunpackbot"],
  ["/docs/bots/personal/boostylib", "/projects/boostylib"],
  ["/docs/bots/personal/payok-aio", "/projects/payok-aio"],
  ["/docs/javascript/auto-vote-rating", "/projects/auto-vote-rating"],
  ["/docs/minecraft/mekanism-stack-processor", "/projects/mekanism-stack-processor"],
  ["/docs/minecraft/craftjs", "/projects/craftjs"],
  ["/docs/minecraft/custom-machinery", "/projects/custom-machinery"],
  ["/docs/minecraft/draconic-evolution", "/projects/draconic-evolution"],
  ["/docs/minecraft/grieflogger", "/projects/grieflogger"],
  ["/docs/minecraft/industrial-foregoing", "/projects/industrial-foregoing"],
  ["/docs/minecraft/justdirethings", "/projects/justdirethings"],
  ["/docs/minecraft/pipez", "/projects/pipez"],
  ["/docs/minecraft/roost-ultimate", "/projects/roost-ultimate"],
  ["/docs/minecraft/titanium", "/projects/titanium"],
  ["/docs/bots", "/projects"],
  ["/docs/bots/orders", "/projects?kind=client"],
  ["/docs/bots/personal", "/projects?kind=product"],
  ["/docs/minecraft", "/projects?kind=mod"],
  ["/docs/javascript", "/projects"],
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Content is read from disk at request time; make sure it ships with the standalone build.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", ...configFiles],
  },
  async redirects() {
    return MOVED_PAGES.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
