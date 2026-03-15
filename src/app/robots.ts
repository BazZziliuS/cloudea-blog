import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const config = getConfig();

  return {
    rules: {
      userAgent: "*",
      allow: config.seo.robots?.index ? "/" : undefined,
      disallow: config.seo.robots?.index ? ["/api/", "/auth/"] : "/",
    },
    sitemap: `${config.url.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
