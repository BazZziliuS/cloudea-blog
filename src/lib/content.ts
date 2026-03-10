import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
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
  series?: string;
  seriesOrder?: number;
}

export interface Doc {
  slug: string[];
  title: string;
  description: string;
  content: string;
  category: string;
  order: number;
  lastModified: string;
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

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface SeriesInfo {
  name: string;
  posts: { slug: string; title: string; order: number }[];
}

// ---- Frontmatter Validation Schemas ----

const postFrontmatterSchema = z.object({
  title: z.string().min(1, "Post title is required"),
  description: z.string().optional().default(""),
  date: z.string().min(1, "Post date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    "Post date must be a valid date string"
  ),
  tags: z.array(z.string()).optional().default([]),
  draft: z.boolean().optional().default(false),
  geo_block: z.object({
    countries: z.array(z.string()),
    message: z.string().optional(),
  }).optional(),
  geoBlock: z.object({
    countries: z.array(z.string()),
    message: z.string().optional(),
  }).optional(),
  series: z.string().optional(),
  seriesOrder: z.number().optional(),
  series_order: z.number().optional(),
});

const docFrontmatterSchema = z.object({
  title: z.string().min(1, "Doc title is required"),
  description: z.string().optional().default(""),
  order: z.number().optional().default(0),
});

export interface ContentWarning {
  file: string;
  message: string;
}

const contentWarnings: ContentWarning[] = [];

export function getContentWarnings(): ContentWarning[] {
  return [...contentWarnings];
}

function validatePostFrontmatter(data: Record<string, unknown>, filePath: string): z.infer<typeof postFrontmatterSchema> {
  const result = postFrontmatterSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      contentWarnings.push({
        file: filePath,
        message: `${issue.path.join(".")}: ${issue.message}`,
      });
    }
    // Return with defaults for missing fields
    return {
      title: (data.title as string) ?? "",
      description: (data.description as string) ?? "",
      date: (data.date as string) ?? "",
      tags: (data.tags as string[]) ?? [],
      draft: (data.draft as boolean) ?? false,
      geo_block: data.geo_block as { countries: string[]; message?: string } | undefined,
      geoBlock: data.geoBlock as { countries: string[]; message?: string } | undefined,
      series: data.series as string | undefined,
      seriesOrder: data.seriesOrder as number | undefined,
      series_order: data.series_order as number | undefined,
    };
  }
  return result.data;
}

function validateDocFrontmatter(data: Record<string, unknown>, filePath: string): z.infer<typeof docFrontmatterSchema> {
  const result = docFrontmatterSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      contentWarnings.push({
        file: filePath,
        message: `${issue.path.join(".")}: ${issue.message}`,
      });
    }
    return {
      title: (data.title as string) ?? "",
      description: (data.description as string) ?? "",
      order: (data.order as number) ?? 0,
    };
  }
  return result.data;
}

// ---- Helpers ----

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");
const DOCS_DIR = path.join(CONTENT_DIR, "docs");

const CONTENT_EXTS = [".mdx", ".md"] as const;

/** Check if a file exists with any supported extension, return the path or null */
function findContentFile(basePath: string): string | null {
  for (const ext of CONTENT_EXTS) {
    const p = basePath + ext;
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Check if a directory-style index file exists (index.mdx or index.md) */
function findIndexFile(dir: string, prefix = "index"): string | null {
  for (const ext of CONTENT_EXTS) {
    const p = path.join(dir, `${prefix}${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Check if a file has a supported content extension */
function isContentFile(name: string): boolean {
  return CONTENT_EXTS.some((ext) => name.endsWith(ext));
}

/** Strip content extension from filename */
function stripContentExt(name: string): string {
  for (const ext of CONTENT_EXTS) {
    if (name.endsWith(ext)) return name.slice(0, -ext.length);
  }
  return name;
}

// ---- Blog ----

function walkBlogDir(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const slugs: string[][] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Check if directory contains index.mdx or index.md (directory-style post)
      if (findIndexFile(path.join(dir, entry.name))) {
        slugs.push([...prefix, entry.name]);
      } else {
        // Recurse into subdirectory (year folders, etc.)
        slugs.push(
          ...walkBlogDir(path.join(dir, entry.name), [...prefix, entry.name])
        );
      }
    } else if (isContentFile(entry.name)) {
      // Skip locale variants (e.g., hello-world.en.mdx) — handled by getPostBySlug
      if (/\.[a-z]{2}\.(mdx|md)$/.test(entry.name)) continue;
      slugs.push([...prefix, stripContentExt(entry.name)]);
    }
  }

  return slugs;
}

/**
 * Resolve the content file path for a post, with optional locale.
 * Supports both .mdx and .md extensions.
 * Lookup order (directory-style):
 *   1. content/blog/.../slug/index.{locale}.{mdx,md}
 *   2. content/blog/.../slug/index.{mdx,md}
 * Lookup order (file-style):
 *   1. content/blog/.../slug.{locale}.{mdx,md}
 *   2. content/blog/.../slug.{mdx,md}
 */
function resolvePostPath(slug: string, locale?: Locale): string {
  const parts = slug.split("/");
  const dirBase = path.join(BLOG_DIR, ...parts);

  // Directory-style with locale
  if (locale) {
    const localeIndex = findIndexFile(dirBase, `index.${locale}`);
    if (localeIndex) return localeIndex;
  }
  // Directory-style default
  const defaultIndex = findIndexFile(dirBase);
  if (defaultIndex) return defaultIndex;

  // File-style with locale
  if (locale) {
    const localeFile = findContentFile(
      path.join(BLOG_DIR, ...parts.slice(0, -1), `${parts[parts.length - 1]}.${locale}`)
    );
    if (localeFile) return localeFile;
  }
  // File-style default
  const defaultFile = findContentFile(path.join(BLOG_DIR, ...parts));
  if (defaultFile) return defaultFile;

  // Fallback (will throw on read)
  return path.join(BLOG_DIR, ...parts) + ".mdx";
}

/** Get available locales for a post */
export function getPostLocales(slug: string): Locale[] {
  const parts = slug.split("/");
  const locales: Locale[] = [];

  // Check directory-style
  const dirBase = path.join(BLOG_DIR, ...parts);
  if (findIndexFile(dirBase)) {
    const files = fs.readdirSync(dirBase);
    for (const f of files) {
      const match = f.match(/^index\.([a-z]{2})\.(mdx|md)$/);
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
      const match = f.match(new RegExp(`^${escapeRegex(baseName)}\\.([a-z]{2})\\.(mdx|md)$`));
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
  const validated = validatePostFrontmatter(data, actualPath);

  return {
    slug,
    title: validated.title,
    description: validated.description,
    date: validated.date,
    tags: validated.tags,
    content,
    readingTime: stats.text,
    draft: validated.draft,
    geoBlock: validated.geo_block ?? validated.geoBlock ?? undefined,
    series: validated.series,
    seriesOrder: validated.seriesOrder ?? validated.series_order,
  };
}

/** Check if a post uses directory format (has index.mdx/md with co-located assets) */
export function isDirectoryPost(slug: string): boolean {
  const parts = slug.split("/");
  return findIndexFile(path.join(BLOG_DIR, ...parts)) !== null;
}

/** Get the filesystem directory for a directory-style post's assets */
export function getPostAssetDir(slug: string): string | null {
  const parts = slug.split("/");
  const dir = path.join(BLOG_DIR, ...parts);
  if (findIndexFile(dir)) return dir;
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

/** Get paginated posts */
export function getPaginatedPosts(page = 1, perPage = 12, includeDrafts = false): PaginatedPosts {
  const allPosts = getAllPosts(includeDrafts);
  const total = allPosts.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const posts = allPosts.slice(start, start + perPage);

  return { posts, total, page, perPage, totalPages };
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

// ---- Series ----

/** Get all posts in a series, sorted by seriesOrder */
export function getSeriesPosts(seriesName: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts
    .filter((p) => p.series === seriesName)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

/** Get series info for a post (prev/next navigation) */
export function getSeriesInfo(post: Post): SeriesInfo | null {
  if (!post.series) return null;
  const seriesPosts = getSeriesPosts(post.series);
  if (seriesPosts.length < 2) return null;

  return {
    name: post.series,
    posts: seriesPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      order: p.seriesOrder ?? 0,
    })),
  };
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
  // Try file-style first: docs/getting-started/introduction.{mdx,md}
  const filePath = findContentFile(path.join(DOCS_DIR, ...slug));
  // Then directory-style: docs/getting-started/index.{mdx,md}
  const indexFilePath = findIndexFile(path.join(DOCS_DIR, ...slug));

  const actualPath = filePath ?? indexFilePath;
  if (!actualPath) throw new Error(`Doc not found: ${slug.join("/")}`);

  const fileContents = fs.readFileSync(actualPath, "utf-8");
  const { data, content } = matter(fileContents);
  const stats = fs.statSync(actualPath);
  const validated = validateDocFrontmatter(data, actualPath);

  // If this is a category index page (e.g. ["getting-started"] from index.mdx),
  // the category is the slug itself
  const isIndexPage = indexFilePath !== null && !filePath;
  const category = isIndexPage ? slug[0] : slug.length > 1 ? slug[0] : "general";

  return {
    slug,
    title: validated.title,
    description: validated.description,
    content,
    category,
    order: validated.order,
    lastModified: stats.mtime.toISOString(),
  };
}

function walkDocsDir(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const slugs: string[][] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Check for index.{mdx,md} (category page)
      if (findIndexFile(path.join(dir, entry.name))) {
        slugs.push([...prefix, entry.name]);
      }
      slugs.push(...walkDocsDir(path.join(dir, entry.name), [...prefix, entry.name]));
    } else if (/^index\.(mdx|md)$/.test(entry.name)) {
      // Already handled above as directory page
      continue;
    } else if (isContentFile(entry.name)) {
      slugs.push([...prefix, stripContentExt(entry.name)]);
    }
  }

  return slugs;
}

export function getAllDocs(): Doc[] {
  const slugs = walkDocsDir(DOCS_DIR);
  return slugs.map((slug) => getDocBySlug(slug));
}

/** Get root docs/index.mdx content, or null if not found */
export function getDocsIndex(): Doc | null {
  const indexPath = findIndexFile(DOCS_DIR);
  if (!indexPath) return null;

  const fileContents = fs.readFileSync(indexPath, "utf-8");
  const { data, content } = matter(fileContents);
  const stats = fs.statSync(indexPath);
  const validated = validateDocFrontmatter(data, indexPath);

  return {
    slug: [],
    title: validated.title,
    description: validated.description,
    content,
    category: "__root__",
    order: validated.order,
    lastModified: stats.mtime.toISOString(),
  };
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
  const filePath = findContentFile(path.join(PAGES_DIR, ...slug));
  if (!filePath) throw new Error(`Page not found: ${slug.join("/")}`);
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
      } else if (isContentFile(entry.name)) {
        slugs.push([...prefix, stripContentExt(entry.name)]);
      }
    }
    return slugs;
  }

  return walk(PAGES_DIR).map((slug) => getCustomPage(slug));
}

export function customPageExists(slug: string[]): boolean {
  return findContentFile(path.join(PAGES_DIR, ...slug)) !== null;
}

// ---- Search index (cached) ----

let cachedSearchIndex: SearchItem[] | null = null;
let searchIndexTimestamp = 0;
const SEARCH_CACHE_TTL = 60_000; // 1 minute

export function getSearchIndex(): SearchItem[] {
  const now = Date.now();
  if (cachedSearchIndex && now - searchIndexTimestamp < SEARCH_CACHE_TTL) {
    return cachedSearchIndex;
  }

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

  cachedSearchIndex = items;
  searchIndexTimestamp = now;
  return items;
}
