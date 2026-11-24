import { absoluteUrl, getConfig } from "@/lib/config";
import { getAllPosts, type Post } from "@/lib/content";
import { rewriteRelativePaths } from "@/lib/content-assets";

export const FEED_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wrap text in CDATA, splitting any `]]>` sequence that would terminate it early. */
function cdata(value: string): string {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

/**
 * Lightweight Markdown → HTML conversion for feed readers.
 *
 * Feeds don't need pixel-perfect output, but code blocks must be protected
 * from inline formatting and MDX-specific syntax must be removed.
 */
export function markdownToHtml(markdown: string): string {
  const codeBlocks: string[] = [];
  const placeholder = (index: number) => `\u0000CODE${index}\u0000`;

  let html = markdown
    // 1. Protect fenced code blocks from further processing.
    .replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code: string) => {
      codeBlocks.push(`<pre><code>${escapeXml(code.replace(/\n$/, ""))}</code></pre>`);
      return placeholder(codeBlocks.length - 1);
    })
    // 2. Drop MDX-only syntax: ESM imports/exports and JSX components.
    .replace(/^(?:import|export)\s.+$/gm, "")
    .replace(/<([A-Z]\w*)[^>]*\/>/g, "")
    .replace(/<([A-Z]\w*)[^>]*>([\s\S]*?)<\/\1>/g, "$2")
    // 3. Block-level elements.
    .replace(/^#{4,6} (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/^\s*\d+\. (.+)$/gm, "<li>$1</li>")
    // 4. Inline elements. Images go first so they aren't parsed as links.
    .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, '<img src="$2" alt="$1"/>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<![*\w])\*(?!\s)(.+?)\*(?!\w)/g, "<em>$1</em>")
    .replace(/`([^`\n]+)`/g, (_, code: string) => `<code>${escapeXml(code)}</code>`);

  // 5. Paragraphs: split on blank lines, leave block elements unwrapped.
  html = html
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (/^(<(h\d|li|pre|img)|\u0000CODE)/.test(block) ? block : `<p>${block}</p>`))
    .join("\n");

  // 6. Restore protected code blocks. The placeholder is a literal, so split/join is safest.
  return codeBlocks.reduce((result, block, index) => result.split(placeholder(index)).join(block), html);
}

function postUrl(post: Post): string {
  return absoluteUrl(`/blog/${post.slug}`);
}

/** Feed HTML for a post, with co-located assets and site links made absolute. */
function postHtml(post: Post): string {
  return markdownToHtml(rewriteRelativePaths(post.content, post.slug, "blog")).replace(
    /(src|href)="\/(?!\/)/g,
    `$1="${absoluteUrl()}/`,
  );
}

export function generateRss(): string {
  const config = getConfig();
  const siteUrl = absoluteUrl();

  const items = getAllPosts()
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl(post)}</link>
      <guid isPermaLink="true">${postUrl(post)}</guid>
      <description>${escapeXml(post.description)}</description>
      <content:encoded>${cdata(postHtml(post))}</content:encoded>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(config.seo.defaultDescription)}</description>
    <language>${config.i18n.defaultLocale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function generateAtom(): string {
  const config = getConfig();
  const siteUrl = absoluteUrl();
  const posts = getAllPosts();
  const updated = posts[0] ? new Date(posts[0].date) : new Date();

  const entries = posts
    .map(
      (post) => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl(post)}"/>
    <id>${postUrl(post)}</id>
    <summary>${escapeXml(post.description)}</summary>
    <content type="html">${cdata(postHtml(post))}</content>
    <updated>${new Date(post.date).toISOString()}</updated>
${post.tags.map((tag) => `    <category term="${escapeXml(tag)}"/>`).join("\n")}
  </entry>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <link href="${siteUrl}"/>
  <link href="${absoluteUrl("/atom.xml")}" rel="self" type="application/atom+xml"/>
  <id>${siteUrl}/</id>
  <subtitle>${escapeXml(config.seo.defaultDescription)}</subtitle>
  <updated>${updated.toISOString()}</updated>
${entries}
</feed>`;
}

export interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  content_html: string;
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

  return {
    version: "https://jsonfeed.org/version/1.1",
    title: config.title,
    home_page_url: absoluteUrl(),
    feed_url: absoluteUrl("/feed.json"),
    description: config.seo.defaultDescription,
    language: config.i18n.defaultLocale,
    items: getAllPosts().map((post) => ({
      id: postUrl(post),
      url: postUrl(post),
      title: post.title,
      summary: post.description,
      content_html: postHtml(post),
      date_published: new Date(post.date).toISOString(),
      tags: post.tags,
    })),
  };
}
