import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import type { Locale } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  readingMinutes: number;
  draft: boolean;
  geoBlock?: GeoBlock;
  series?: string;
  seriesOrder?: number;
  /** Source file path relative to the project root (POSIX separators). */
  sourcePath: string;
}

export interface Doc {
  slug: string[];
  title: string;
  description: string;
  content: string;
  category: string;
  order: number;
  lastModified: string;
  /** Source file path relative to the project root (POSIX separators). */
  sourcePath: string;
}

export interface CustomPage {
  slug: string[];
  title: string;
  description: string;
  content: string;
}

export interface SidebarDoc {
  slug: string[];
  title: string;
  order: number;
}

export interface SidebarSubcategory {
  name: string;
  title?: string;
  indexSlug?: string[];
  docs: SidebarDoc[];
}

export interface SidebarCategory extends SidebarSubcategory {
  subcategories: SidebarSubcategory[];
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

export interface ContentWarning {
  file: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");
const DOCS_DIR = path.join(CONTENT_DIR, "docs");
const PAGES_DIR = path.join(CONTENT_DIR, "pages");

const CONTENT_EXTS = [".mdx", ".md"] as const;
const LOCALE_VARIANT_RE = /\.[a-z]{2}\.(?:mdx|md)$/;
const INDEX_FILE_RE = /^index\.(?:mdx|md)$/;

// ---------------------------------------------------------------------------
// Caching
//
// Content is immutable within a production deployment, so parsed results are
// cached for the lifetime of the process. In development a short TTL keeps
// editing responsive while still deduplicating work within a single request.
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = process.env.NODE_ENV === "production" ? Number.POSITIVE_INFINITY : 1_000;

function cached<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
): (...args: Args) => Result {
  const store = new Map<string, { value: Result; expiresAt: number }>();

  return (...args: Args): Result => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const hit = store.get(key);
    if (hit && hit.expiresAt > now) return hit.value;

    const value = fn(...args);
    store.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  };
}

// ---------------------------------------------------------------------------
// Frontmatter validation
// ---------------------------------------------------------------------------

const geoBlockSchema = z.object({
  countries: z.array(z.string()),
  message: z.string().optional(),
});

const postFrontmatterSchema = z
  .object({
    title: z.string().min(1, "Post title is required"),
    description: z.string().default(""),
    date: z
      .union([z.string(), z.date()])
      .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
      .refine((value) => !Number.isNaN(Date.parse(value)), "Post date must be a valid date"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    geo_block: geoBlockSchema.optional(),
    geoBlock: geoBlockSchema.optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    series_order: z.number().optional(),
  })
  .transform(({ geo_block, series_order, ...rest }) => ({
    ...rest,
    geoBlock: rest.geoBlock ?? geo_block,
    seriesOrder: rest.seriesOrder ?? series_order,
  }));

const docFrontmatterSchema = z.object({
  title: z.string().min(1, "Doc title is required"),
  description: z.string().default(""),
  order: z.number().default(0),
});

const pageFrontmatterSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
});

const contentWarnings = new Map<string, ContentWarning[]>();

export function getContentWarnings(): ContentWarning[] {
  return [...contentWarnings.values()].flat();
}

/**
 * Validate frontmatter against a schema. Invalid files are reported via
 * {@link getContentWarnings} and parsed leniently so a single broken file
 * doesn't take the whole site down.
 */
function parseFrontmatter<T extends z.ZodType>(
  schema: T,
  data: Record<string, unknown>,
  file: string,
  fallback: (data: Record<string, unknown>) => z.output<T>,
): z.output<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    contentWarnings.delete(file);
    return result.data;
  }

  contentWarnings.set(
    file,
    result.error.issues.map((issue) => ({
      file,
      message: `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    })),
  );
  return fallback(data);
}

const asString = (value: unknown, fallback = ""): string => (typeof value === "string" ? value : fallback);

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

/** Return the first existing `${basePath}{.mdx,.md}` file, or null. */
function findContentFile(basePath: string): string | null {
  for (const ext of CONTENT_EXTS) {
    const candidate = basePath + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Return the first existing `${dir}/${name}{.mdx,.md}` file, or null. */
function findIndexFile(dir: string, name = "index"): string | null {
  // content/ is bundled explicitly via outputFileTracingIncludes (next.config.ts).
  return findContentFile(path.join(/* turbopackIgnore: true */ dir, name));
}

function isContentFile(name: string): boolean {
  return CONTENT_EXTS.some((ext) => name.endsWith(ext));
}

function stripContentExt(name: string): string {
  const ext = CONTENT_EXTS.find((e) => name.endsWith(e));
  return ext ? name.slice(0, -ext.length) : name;
}

function toSourcePath(absolutePath: string): string {
  return path.relative(ROOT_DIR, absolutePath).split(path.sep).join("/");
}

function readMatter(filePath: string) {
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return { data: data as Record<string, unknown>, content };
}

/**
 * Last commit date for every file under `content/`, collected with a single
 * `git log` call. Returns an empty map outside a git checkout (e.g. Docker).
 */
const getGitDates = cached((): Map<string, string> => {
  const dates = new Map<string, string>();
  try {
    const output = execFileSync(
      "git",
      ["log", "--format=%x00%cI", "--name-only", "--no-renames", "--", "content"],
      { cwd: ROOT_DIR, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 32 * 1024 * 1024 },
    );

    // Each commit block: "\0<date>\n\n<file>\n<file>..."; newest commits first.
    for (const block of output.split("\0")) {
      const [date, ...files] = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!date) continue;
      for (const file of files) {
        if (!dates.has(file)) dates.set(file, date);
      }
    }
  } catch {
    // git is unavailable — callers fall back to filesystem mtime.
  }
  return dates;
});

function getLastModified(filePath: string): string {
  return getGitDates().get(toSourcePath(filePath)) ?? fs.statSync(filePath).mtime.toISOString();
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

function walkBlogDir(dir: string, prefix: string[] = []): string[] {
  if (!fs.existsSync(dir)) return [];

  const slugs: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const segments = [...prefix, entry.name];

    if (entry.isDirectory()) {
      const full = path.join(dir, entry.name);
      // A directory with an index file is a post with co-located assets;
      // otherwise it's a grouping folder (e.g. a year).
      if (findIndexFile(full)) slugs.push(segments.join("/"));
      else slugs.push(...walkBlogDir(full, segments));
    } else if (isContentFile(entry.name) && !LOCALE_VARIANT_RE.test(entry.name)) {
      slugs.push([...prefix, stripContentExt(entry.name)].join("/"));
    }
  }
  return slugs;
}

const getBlogSlugs = cached(() => walkBlogDir(BLOG_DIR));

/**
 * Resolve the source file for a post.
 *
 * Lookup order:
 *   1. `slug/index.{locale}.{mdx,md}`  2. `slug/index.{mdx,md}`
 *   3. `slug.{locale}.{mdx,md}`        4. `slug.{mdx,md}`
 */
function resolvePostPath(slug: string, locale?: Locale): string | null {
  const base = path.join(BLOG_DIR, ...slug.split("/"));

  return (
    (locale ? findIndexFile(base, `index.${locale}`) : null) ??
    findIndexFile(base) ??
    (locale ? findContentFile(`${base}.${locale}`) : null) ??
    findContentFile(base)
  );
}

/** Locales that have a dedicated translation file for the given post. */
export function getPostLocales(slug: string): Locale[] {
  const base = path.join(BLOG_DIR, ...slug.split("/"));

  const [dir, pattern] = findIndexFile(base)
    ? [base, /^index\.([a-z]{2})\.(?:mdx|md)$/]
    : [path.dirname(base), new RegExp(`^${escapeRegex(path.basename(base))}\\.([a-z]{2})\\.(?:mdx|md)$`)];

  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .map((file) => pattern.exec(file)?.[1])
    .filter((locale): locale is Locale => Boolean(locale));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class ContentNotFoundError extends Error {
  constructor(kind: string, slug: string) {
    super(`${kind} not found: ${slug}`);
    this.name = "ContentNotFoundError";
  }
}

export const getPostBySlug = cached((slug: string, locale?: Locale): Post => {
  const filePath = resolvePostPath(slug, locale);
  if (!filePath) throw new ContentNotFoundError("Post", slug);

  const { data, content } = readMatter(filePath);
  const sourcePath = toSourcePath(filePath);
  const fm = parseFrontmatter(postFrontmatterSchema, data, sourcePath, (raw) => ({
    title: asString(raw.title, slug),
    description: asString(raw.description),
    date: asString(raw.date, "1970-01-01"),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    draft: raw.draft === true,
    geoBlock: undefined,
    seriesOrder: undefined,
  }));

  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    tags: fm.tags,
    content,
    readingMinutes: Math.max(1, Math.ceil(readingTime(content, { wordsPerMinute: 130 }).minutes)),
    draft: fm.draft,
    geoBlock: fm.geoBlock,
    series: fm.series,
    seriesOrder: fm.seriesOrder,
    sourcePath,
  };
});

export function postExists(slug: string): boolean {
  return resolvePostPath(slug) !== null;
}

export const getAllPosts = cached((includeDrafts = false, locale?: Locale): Post[] =>
  getBlogSlugs()
    .map((slug) => getPostBySlug(slug, locale))
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
);

export function getPaginatedPosts(page = 1, perPage = 12, locale?: Locale): PaginatedPosts {
  const allPosts = getAllPosts(false, locale);
  const start = (page - 1) * perPage;

  return {
    posts: allPosts.slice(start, start + perPage),
    total: allPosts.length,
    page,
    perPage,
    totalPages: Math.ceil(allPosts.length / perPage),
  };
}

/** Posts sharing the most tags with the given one, excluding the post itself. */
export function getRelatedPosts(slug: string, tags: string[], limit = 3, locale?: Locale): Post[] {
  const tagSet = new Set(tags);
  return getAllPosts(false, locale)
    .filter((post) => post.slug !== slug)
    .map((post) => ({ post, score: post.tags.filter((tag) => tagSet.has(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}

/** Series navigation for a post, or null when the post isn't part of a series of 2+. */
export function getSeriesInfo(post: Post, locale?: Locale): SeriesInfo | null {
  if (!post.series) return null;

  const seriesPosts = getAllPosts(false, locale)
    .filter((p) => p.series === post.series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
  if (seriesPosts.length < 2) return null;

  return {
    name: post.series,
    posts: seriesPosts.map((p) => ({ slug: p.slug, title: p.title, order: p.seriesOrder ?? 0 })),
  };
}

// ---------------------------------------------------------------------------
// Tags & archive
// ---------------------------------------------------------------------------

function countBy<K>(items: K[]): Map<K, number> {
  const counts = new Map<K, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return counts;
}

export const getAllTags = cached((): TagInfo[] =>
  [...countBy(getAllPosts().flatMap((post) => post.tags))]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
);

export function getPostsByTag(tag: string, locale?: Locale): Post[] {
  const needle = tag.toLowerCase();
  return getAllPosts(false, locale).filter((post) => post.tags.some((t) => t.toLowerCase() === needle));
}

export const getAllYears = cached((): { year: number; count: number }[] =>
  [...countBy(getAllPosts().map((post) => new Date(post.date).getFullYear()))]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year),
);

// ---------------------------------------------------------------------------
// Docs
// ---------------------------------------------------------------------------

function readDoc(filePath: string, slug: string[], category: string): Doc {
  const { data, content } = readMatter(filePath);
  const sourcePath = toSourcePath(filePath);
  const fm = parseFrontmatter(docFrontmatterSchema, data, sourcePath, (raw) => ({
    title: asString(raw.title, slug.at(-1) ?? ""),
    description: asString(raw.description),
    order: typeof raw.order === "number" ? raw.order : 0,
  }));

  return {
    slug,
    title: fm.title,
    description: fm.description,
    content,
    category,
    order: fm.order,
    lastModified: getLastModified(filePath),
    sourcePath,
  };
}

export const getDocBySlug = cached((slug: string[]): Doc => {
  const base = path.join(DOCS_DIR, ...slug);
  // File-style (`docs/a/b.mdx`) takes precedence over directory-style (`docs/a/b/index.mdx`).
  const filePath = findContentFile(base);
  const indexPath = filePath ? null : findIndexFile(base);
  const actualPath = filePath ?? indexPath;
  if (!actualPath) throw new ContentNotFoundError("Doc", slug.join("/"));

  // A top-level index page (e.g. ["bots"]) belongs to its own category.
  const category = indexPath || slug.length > 1 ? slug[0] : "general";
  return readDoc(actualPath, slug, category);
});

function walkDocsDir(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];

  const slugs: string[][] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const segments = [...prefix, entry.name];

    if (entry.isDirectory()) {
      const full = path.join(dir, entry.name);
      if (findIndexFile(full)) slugs.push(segments);
      slugs.push(...walkDocsDir(full, segments));
    } else if (isContentFile(entry.name) && !INDEX_FILE_RE.test(entry.name)) {
      slugs.push([...prefix, stripContentExt(entry.name)]);
    }
  }
  return slugs;
}

export const getAllDocs = cached((): Doc[] => walkDocsDir(DOCS_DIR).map((slug) => getDocBySlug(slug)));

/** Root `content/docs/index.mdx`, or null if absent. */
export const getDocsIndex = cached((): Doc | null => {
  const indexPath = findIndexFile(DOCS_DIR);
  return indexPath ? readDoc(indexPath, [], "__root__") : null;
});

function getOrCreateSubcategory(category: SidebarCategory, name: string): SidebarSubcategory {
  let sub = category.subcategories.find((s) => s.name === name);
  if (!sub) {
    sub = { name, docs: [] };
    category.subcategories.push(sub);
  }
  return sub;
}

export const getDocsSidebar = cached((): SidebarCategory[] => {
  const categories = new Map<string, SidebarCategory>();

  for (const doc of getAllDocs()) {
    let category = categories.get(doc.category);
    if (!category) {
      category = { name: doc.category, docs: [], subcategories: [] };
      categories.set(doc.category, category);
    }

    const entry: SidebarDoc = { slug: doc.slug, title: doc.title, order: doc.order };

    // Category index page, e.g. ["bots"]
    if (doc.slug.length === 1 && doc.slug[0] === category.name) {
      category.indexSlug = doc.slug;
      category.title = doc.title;
      continue;
    }

    // Nested doc, e.g. ["bots", "orders", "auroralands"] → subcategory "orders"
    if (doc.slug.length >= 3) {
      getOrCreateSubcategory(category, doc.slug[1]).docs.push(entry);
      continue;
    }

    // Subcategory index page, e.g. ["bots", "orders"] backed by a directory
    if (doc.slug.length === 2) {
      const subDir = path.join(DOCS_DIR, ...doc.slug);
      if (fs.existsSync(subDir) && fs.statSync(subDir).isDirectory()) {
        const sub = getOrCreateSubcategory(category, doc.slug[1]);
        sub.indexSlug = doc.slug;
        sub.title = doc.title;
        continue;
      }
    }

    category.docs.push(entry);
  }

  const byOrder = (a: SidebarDoc, b: SidebarDoc) => a.order - b.order;
  for (const category of categories.values()) {
    category.docs.sort(byOrder);
    for (const sub of category.subcategories) sub.docs.sort(byOrder);
    category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
});

// ---------------------------------------------------------------------------
// Custom pages (content/pages)
// ---------------------------------------------------------------------------

export function customPageExists(slug: string[]): boolean {
  return findContentFile(path.join(PAGES_DIR, ...slug)) !== null;
}

export const getCustomPage = cached((slug: string[]): CustomPage => {
  const filePath = findContentFile(path.join(PAGES_DIR, ...slug));
  if (!filePath) throw new ContentNotFoundError("Page", slug.join("/"));

  const { data, content } = readMatter(filePath);
  const fm = parseFrontmatter(pageFrontmatterSchema, data, toSourcePath(filePath), () => ({
    title: "",
    description: "",
  }));

  return { slug, title: fm.title, description: fm.description, content };
});

function walkPagesDir(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return walkPagesDir(path.join(dir, entry.name), [...prefix, entry.name]);
    return isContentFile(entry.name) ? [[...prefix, stripContentExt(entry.name)]] : [];
  });
}

export const getAllCustomPages = cached((): CustomPage[] =>
  walkPagesDir(PAGES_DIR).map((slug) => getCustomPage(slug)),
);

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const getSearchIndex = cached((): SearchItem[] => [
  ...getAllPosts().map(
    (post): SearchItem => ({
      type: "blog",
      title: post.title,
      description: post.description,
      href: `/blog/${post.slug}`,
      tags: post.tags,
    }),
  ),
  ...getAllDocs().map(
    (doc): SearchItem => ({
      type: "docs",
      title: doc.title,
      description: doc.description,
      href: `/docs/${doc.slug.join("/")}`,
      category: doc.category,
    }),
  ),
]);

export function searchContent(query: string, limit = 20): SearchItem[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  return getSearchIndex()
    .filter((item) => {
      const haystack = [item.title, item.description, ...(item.tags ?? []), item.category ?? ""]
        .join(" ")
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    })
    .slice(0, limit);
}
