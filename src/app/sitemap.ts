import type { MetadataRoute } from "next";
import { getAllPosts, getAllDocs, getAllTags } from "@/lib/content";
import { getConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getConfig();
  const baseUrl = config.url.replace(/\/+$/, "");

  const posts = getAllPosts();
  const docs = getAllDocs();

  // Используем дату последнего поста как lastModified для списковых страниц
  const latestPostDate = posts.length > 0
    ? new Date(posts[0].date)
    : new Date("2025-01-01");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/tags`,
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/archive`,
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const docPages: MetadataRoute.Sitemap = docs.map((doc) => ({
    url: `${baseUrl}/docs/${doc.slug.join("/")}`,
    lastModified: latestPostDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const tagPages: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${baseUrl}/blog/tags/${tag.name}`,
    lastModified: latestPostDate,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...blogPages, ...docPages, ...tagPages];
}
