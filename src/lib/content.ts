import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { defaultLocale, type Locale } from "@/lib/i18n";

// ---- Types ----

export interface GeoBlock {
  countries: string[];
  message?: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readingTime: string;
  draft?: boolean;
  geoBlock?: GeoBlock;
}

export interface Doc {
  slug: string[];
  title: string;
  description: string;
  content: string;
  category: string;
  order: number;
}

export interface SidebarCategory {
  name: string;
  indexSlug?: string[];
  docs: { slug: string[]; title: string; order: number }[];
}

export interface TagInfo {
  name: string;
  count: number;
}

export interface SearchItem {
  type: "blog" | "docs";
  title: string;
  description: string;
  href: string;
  tags?: string[];
  category?: string;
}

// ---- Helpers ----

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");
const DOCS_DIR = path.join(CONTENT_DIR, "docs");

// ---- Blog ----

function walkBlogDir(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const slugs: string[][] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Check if directory contains index.mdx (directory-style post)
      const indexPath = path.join(dir, entry.name, "index.mdx");
      if (fs.existsSync(indexPath)) {
        slugs.push([...prefix, entry.name]);
      } else {
        // Recurse into subdirectory (year folders, etc.)
        slugs.push(
          ...walkBlogDir(path.join(dir, entry.name), [...prefix, entry.name])
        );
      }
    } else if (entry.name.endsWith(".mdx")) {
      // Skip locale variants (e.g., hello-world.en.mdx) — handled by getPostBySlug
      if (/\.[a-z]{2}\.mdx$/.test(entry.name)) continue;
      slugs.push([...prefix, entry.name.replace(/\.mdx$/, "")]);
    }
  }

  return slugs;
}

/**
 * Resolve the MDX file path for a post, with optional locale.
 * Lookup order (directory-style):
 *   1. content/blog/.../slug/index.{locale}.mdx
 *   2. content/blog/.../slug/index.mdx
 * Lookup order (file-style):
 *   1. content/blog/.../slug.{locale}.mdx
 *   2. content/blog/.../slug.mdx
 */
function resolvePostPath(slug: string, locale?: Locale): string {
  const parts = slug.split("/");

  // Directory-style
  const dirBase = path.join(BLOG_DIR, ...parts);
  if (locale) {
    const localeIndex = path.join(dirBase, `index.${locale}.mdx`);
    if (fs.existsSync(localeIndex)) return localeIndex;
  }
  const defaultIndex = path.join(dirBase, "index.mdx");
  if (fs.existsSync(defaultIndex)) return defaultIndex;

  // File-style
  if (locale) {
    const localeFile = path.join(BLOG_DIR, ...parts.slice(0, -1), `${parts[parts.length - 1]}.${locale}.mdx`);
    if (fs.existsSync(localeFile)) return localeFile;
  }
  return path.join(BLOG_DIR, ...parts) + ".mdx";
}

/** Get available locales for a post */
export function getPostLocales(slug: string): Locale[] {
  const parts = slug.split("/");
  const locales: Locale[] = [];

  // Check directory-style
  const dirBase = path.join(BLOG_DIR, ...parts);
  if (fs.existsSync(path.join(dirBase, "index.mdx"))) {
    const files = fs.readdirSync(dirBase);
    for (const f of files) {
      const match = f.match(/^index\.([a-z]{2})\.mdx$/);
      if (match) locales.push(match[1] as Locale);
    }
    return locales;
  }

  // Check file-style
  const dir = path.join(BLOG_DIR, ...parts.slice(0, -1));
  const baseName = parts[parts.length - 1];
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const match = f.match(new RegExp(`^${escapeRegex(baseName)}\\.([a-z]{2})\\.mdx$`));
      if (match) locales.push(match[1] as Locale);
    }
  }

  return locales;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getPostBySlug(slug: string, locale?: Locale): Post {
  const actualPath = resolvePostPath(slug, locale);
  const fileContents = fs.readFileSync(actualPath, "utf-8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    content,
    readingTime: stats.text,
    draft: data.draft ?? false,
    geoBlock: data.geo_block ?? data.geoBlock ?? undefined,
  };
}

/** Check if a post uses directory format (has index.mdx with co-located assets) */
export function isDirectoryPost(slug: string): boolean {
  const parts = slug.split("/");
  return fs.existsSync(path.join(BLOG_DIR, ...parts, "index.mdx"));
}

/** Get the filesystem directory for a directory-style post's assets */
export function getPostAssetDir(slug: string): string | null {
  const parts = slug.split("/");
  const dir = path.join(BLOG_DIR, ...parts);
  if (fs.existsSync(path.join(dir, "index.mdx"))) {
    return dir;
  }
  return null;
}

export function getAllPosts(includeDrafts = false): Post[] {
  const slugParts = walkBlogDir(BLOG_DIR);

  const posts = slugParts
    .map((parts) => {
      const slug = parts.join("/");
      return getPostBySlug(slug);
    })
    .filter((post) => includeDrafts || !post.draft);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Get related posts by shared tags (excluding the current post) */
export function getRelatedPosts(slug: string, tags: string[], limit = 3): Post[] {
  const allPosts = getAllPosts();
  return allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => tags.includes(t)).length,
    }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p) => p.post);
}

// ---- Tags ----

export function getAllTags(): TagInfo[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

// ---- Archive (years) ----

export function getAllYears(): { year: number; count: number }[] {
  const posts = getAllPosts();
  const yearMap = new Map<number, number>();

  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
  }

  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year);
}

export function getPostsByYear(year: number): Post[] {
  return getAllPosts().filter(
    (post) => new Date(post.date).getFullYear() === year
  );
}

// ---- Docs ----

export function getDocBySlug(slug: string[]): Doc {
  // Try file-style first: docs/getting-started/introduction.mdx
  const filePath = path.join(DOCS_DIR, ...slug) + ".mdx";
  // Then directory-style: docs/getting-started/index.mdx
  const indexPath = path.join(DOCS_DIR, ...slug, "index.mdx");

  const actualPath = fs.existsSync(filePath) ? filePath : indexPath;
  const fileContents = fs.readFileSync(actualPath, "utf-8");
  const { data, content } = matter(fileContents);

  // If this is a category index page (e.g. ["getting-started"] from index.mdx),
  // the category is the slug itself
  const isIndexPage = fs.existsSync(path.join(DOCS_DIR, ...slug, "index.mdx"));
  const category = isIndexPage ? slug[0] : slug.length > 1 ? slug[0] : "general";

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    content,
    category,
    order: data.order ?? 0,
  };
}

function walkDocsDir(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const slugs: string[][] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Check for index.mdx (category page)
      const indexPath = path.join(dir, entry.name, "index.mdx");
      if (fs.existsSync(indexPath)) {
        slugs.push([...prefix, entry.name]);
      }
      slugs.push(...walkDocsDir(path.join(dir, entry.name), [...prefix, entry.name]));
    } else if (entry.name === "index.mdx") {
      // Already handled above as directory page
      continue;
    } else if (entry.name.endsWith(".mdx")) {
      slugs.push([...prefix, entry.name.replace(/\.mdx$/, "")]);
    }
  }

  return slugs;
}

export function getAllDocs(): Doc[] {
  const slugs = walkDocsDir(DOCS_DIR);
  return slugs.map((slug) => getDocBySlug(slug));
}

export function getDocsSidebar(): SidebarCategory[] {
  const docs = getAllDocs();

  const categories = new Map<string, SidebarCategory>();

  for (const doc of docs) {
    const categoryName = doc.category;
    if (!categories.has(categoryName)) {
      categories.set(categoryName, { name: categoryName, docs: [] });
    }
    // If this is the category index page (slug matches category name), set as indexSlug
    const isIndex = doc.slug.length === 1 && doc.slug[0] === categoryName;
    if (isIndex) {
      categories.get(categoryName)!.indexSlug = doc.slug;
      continue;
    }
    categories.get(categoryName)!.docs.push({
      slug: doc.slug,
      title: doc.title,
      order: doc.order,
    });
  }

  for (const category of categories.values()) {
    category.docs.sort((a, b) => a.order - b.order);
  }

  return Array.from(categories.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

// ---- Custom Pages ----

const PAGES_DIR = path.join(CONTENT_DIR, "pages");

export interface CustomPage {
  slug: string[];
  title: string;
  description: string;
  content: string;
}

export function getCustomPage(slug: string[]): CustomPage {
  const filePath = path.join(PAGES_DIR, ...slug) + ".mdx";
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    content,
  };
}

export function getAllCustomPages(): CustomPage[] {
  if (!fs.existsSync(PAGES_DIR)) return [];

  function walk(dir: string, prefix: string[] = []): string[][] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const slugs: string[][] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        slugs.push(...walk(path.join(dir, entry.name), [...prefix, entry.name]));
      } else if (entry.name.endsWith(".mdx")) {
        slugs.push([...prefix, entry.name.replace(/\.mdx$/, "")]);
      }
    }
    return slugs;
  }

  return walk(PAGES_DIR).map((slug) => getCustomPage(slug));
}

export function customPageExists(slug: string[]): boolean {
  const filePath = path.join(PAGES_DIR, ...slug) + ".mdx";
  return fs.existsSync(filePath);
}

// ---- Search index ----

export function getSearchIndex(): SearchItem[] {
  const posts = getAllPosts();
  const docs = getAllDocs();

  const items: SearchItem[] = [];

  for (const post of posts) {
    items.push({
      type: "blog",
      title: post.title,
      description: post.description,
      href: `/blog/${post.slug}`,
      tags: post.tags,
    });
  }

  for (const doc of docs) {
    items.push({
      type: "docs",
      title: doc.title,
      description: doc.description,
      href: `/docs/${doc.slug.join("/")}`,
      category: doc.category,
    });
  }

  return items;
}
