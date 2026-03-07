import { getAllPosts } from "@/lib/content";
import { getConfig } from "@/lib/config";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateRss(): string {
  const config = getConfig();
  const posts = getAllPosts();
  const url = config.url;

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}/blog/${post.slug}</link>
      <guid isPermaLink="true">${url}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${url}</link>
    <description>${escapeXml(config.seo.defaultDescription)}</description>
    <language>${config.i18n.defaultLocale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function generateAtom(): string {
  const config = getConfig();
  const posts = getAllPosts();
  const url = config.url;

  const entries = posts
    .map(
      (post) => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${url}/blog/${post.slug}"/>
    <id>${url}/blog/${post.slug}</id>
    <summary>${escapeXml(post.description)}</summary>
    <updated>${new Date(post.date).toISOString()}</updated>
    ${post.tags.map((tag) => `<category term="${escapeXml(tag)}"/>`).join("\n    ")}
  </entry>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <link href="${url}"/>
  <link href="${url}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${url}/</id>
  <subtitle>${escapeXml(config.seo.defaultDescription)}</subtitle>
  <updated>${new Date().toISOString()}</updated>
${entries}
</feed>`;
}

export interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  date_published: string;
  tags: string[];
}

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  language: string;
  items: JsonFeedItem[];
}

export function generateJsonFeed(): JsonFeed {
  const config = getConfig();
  const posts = getAllPosts();
  const url = config.url;

  return {
    version: "https://jsonfeed.org/version/1.1",
    title: config.title,
    home_page_url: url,
    feed_url: `${url}/feed.json`,
    description: config.seo.defaultDescription,
    language: config.i18n.defaultLocale,
    items: posts.map((post) => ({
      id: `${url}/blog/${post.slug}`,
      url: `${url}/blog/${post.slug}`,
      title: post.title,
      summary: post.description,
      date_published: new Date(post.date).toISOString(),
      tags: post.tags,
    })),
  };
}
