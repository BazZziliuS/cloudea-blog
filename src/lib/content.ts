import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

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
      slugs.push([...prefix, entry.name.replace(/\.mdx$/, "")]);
    }
  }

  return slugs;
}

export function getPostBySlug(slug: string): Post {
  const parts = slug.split("/");

  // Try directory-style first: content/blog/2025/my-post/index.mdx
  const indexPath = path.join(BLOG_DIR, ...parts, "index.mdx");
  // Then file-style: content/blog/2025/my-post.mdx
  const filePath = path.join(BLOG_DIR, ...parts) + ".mdx";

  const actualPath = fs.existsSync(indexPath) ? indexPath : filePath;
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

export function getAllPosts(): Post[] {
  const slugParts = walkBlogDir(BLOG_DIR);

  const posts = slugParts.map((parts) => {
    const slug = parts.join("/");
    return getPostBySlug(slug);
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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
  const filePath = path.join(DOCS_DIR, ...slug) + ".mdx";
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);

  const category = slug.length > 1 ? slug[0] : "general";

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
      slugs.push(...walkDocsDir(path.join(dir, entry.name), [...prefix, entry.name]));
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
