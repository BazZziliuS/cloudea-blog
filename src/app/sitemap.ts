import type { MetadataRoute } from "next";
import { absoluteUrl, getConfig } from "@/lib/config";
import { getAllCustomPages, getAllDocs, getAllPosts, getAllTags } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const docs = getAllDocs();
  const latestPostDate = posts[0] ? new Date(posts[0].date) : undefined;
  const latestDocDate = docs.reduce<Date | undefined>((latest, doc) => {
    const date = new Date(doc.lastModified);
    return !latest || date > latest ? date : latest;
  }, undefined);

  // When the blog is the homepage, /blog redirects to / and must not be listed.
  const blogIsHomepage = getConfig().homepage === "blog";

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl(), lastModified: latestPostDate, changeFrequency: "daily", priority: 1 },
    ...(blogIsHomepage
      ? []
      : [{ url: absoluteUrl("/blog"), lastModified: latestPostDate, changeFrequency: "daily" as const, priority: 0.9 }]),
    { url: absoluteUrl("/docs"), lastModified: latestDocDate, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog/tags"), lastModified: latestPostDate, changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/blog/archive"), lastModified: latestPostDate, changeFrequency: "weekly", priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const docPages: MetadataRoute.Sitemap = docs.map((doc) => ({
    url: absoluteUrl(`/docs/${doc.slug.join("/")}`),
    lastModified: new Date(doc.lastModified),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const customPages: MetadataRoute.Sitemap = getAllCustomPages().map((page) => ({
    url: absoluteUrl(`/${page.slug.join("/")}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const tagPages: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: absoluteUrl(`/blog/tags/${encodeURIComponent(tag.name)}`),
    lastModified: latestPostDate,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...blogPages, ...docPages, ...customPages, ...tagPages];
}
