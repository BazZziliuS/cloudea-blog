import type { MetadataRoute } from "next";
import { absoluteUrl, getConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const indexable = getConfig().seo.robots?.index ?? true;

  return {
    rules: indexable
      ? {
          userAgent: "*",
          // Content images and OG images live under /api and should stay crawlable.
          allow: ["/", "/api/content/", "/api/og"],
          disallow: ["/api/", "/auth/"],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
