import { describe, it, expect } from "vitest";
import {
  getAllPosts,
  getAllDocs,
  getAllTags,
  getAllYears,
  getSearchIndex,
  getPaginatedPosts,
  getPostsByTag,
  getContentWarnings,
  customPageExists,
  getAllCustomPages,
} from "@/lib/content";

describe("content.ts", () => {
  describe("getAllPosts", () => {
    it("returns an array of posts", () => {
      const posts = getAllPosts();
      expect(Array.isArray(posts)).toBe(true);
    });

    it("posts are sorted by date descending", () => {
      const posts = getAllPosts();
      if (posts.length < 2) return;
      for (let i = 1; i < posts.length; i++) {
        expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
          new Date(posts[i].date).getTime()
        );
      }
    });

    it("excludes drafts by default", () => {
      const posts = getAllPosts();
      const drafts = posts.filter((p) => p.draft);
      expect(drafts.length).toBe(0);
    });

    it("each post has required fields", () => {
      const posts = getAllPosts(true);
      for (const post of posts) {
        expect(post.slug).toBeTruthy();
        expect(typeof post.title).toBe("string");
        expect(typeof post.content).toBe("string");
        expect(typeof post.readingTime).toBe("string");
        expect(Array.isArray(post.tags)).toBe(true);
      }
    });
  });

  describe("getPaginatedPosts", () => {
    it("returns correct pagination metadata", () => {
      const result = getPaginatedPosts(1, 2);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(2);
      expect(result.posts.length).toBeLessThanOrEqual(2);
      expect(result.totalPages).toBe(Math.ceil(result.total / 2));
    });

    it("returns empty for page beyond total", () => {
      const result = getPaginatedPosts(999, 12);
      expect(result.posts.length).toBe(0);
    });
  });

  describe("getAllDocs", () => {
    it("returns an array of docs", () => {
      const docs = getAllDocs();
      expect(Array.isArray(docs)).toBe(true);
    });

    it("each doc has required fields", () => {
      const docs = getAllDocs();
      for (const doc of docs) {
        expect(Array.isArray(doc.slug)).toBe(true);
        expect(typeof doc.title).toBe("string");
        expect(typeof doc.content).toBe("string");
        expect(typeof doc.category).toBe("string");
        expect(typeof doc.order).toBe("number");
      }
    });
  });

  describe("getAllTags", () => {
    it("returns tags with counts", () => {
      const tags = getAllTags();
      expect(Array.isArray(tags)).toBe(true);
      for (const tag of tags) {
        expect(typeof tag.name).toBe("string");
        expect(typeof tag.count).toBe("number");
        expect(tag.count).toBeGreaterThan(0);
      }
    });

    it("tags are sorted by count descending", () => {
      const tags = getAllTags();
      if (tags.length < 2) return;
      for (let i = 1; i < tags.length; i++) {
        expect(tags[i - 1].count).toBeGreaterThanOrEqual(tags[i].count);
      }
    });
  });

  describe("getPostsByTag", () => {
    it("returns posts with matching tag (case insensitive)", () => {
      const tags = getAllTags();
      if (tags.length === 0) return;
      const tag = tags[0].name;
      const posts = getPostsByTag(tag);
      expect(posts.length).toBe(tags[0].count);
      for (const post of posts) {
        expect(post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())).toBe(true);
      }
    });
  });

  describe("getAllYears", () => {
    it("returns years sorted descending", () => {
      const years = getAllYears();
      if (years.length < 2) return;
      for (let i = 1; i < years.length; i++) {
        expect(years[i - 1].year).toBeGreaterThan(years[i].year);
      }
    });
  });

  describe("getSearchIndex", () => {
    it("returns search items for blog and docs", () => {
      const index = getSearchIndex();
      expect(Array.isArray(index)).toBe(true);
      const types = new Set(index.map((i) => i.type));
      // Should have at least blog items if posts exist
      const posts = getAllPosts();
      if (posts.length > 0) {
        expect(types.has("blog")).toBe(true);
      }
    });

    it("search items have required fields", () => {
      const index = getSearchIndex();
      for (const item of index) {
        expect(typeof item.title).toBe("string");
        expect(typeof item.description).toBe("string");
        expect(typeof item.href).toBe("string");
        expect(["blog", "docs"]).toContain(item.type);
      }
    });

    it("returns cached results on second call", () => {
      const a = getSearchIndex();
      const b = getSearchIndex();
      expect(a).toBe(b); // same reference = cached
    });
  });

  describe("customPageExists", () => {
    it("returns true for existing page", () => {
      const pages = getAllCustomPages();
      if (pages.length > 0) {
        expect(customPageExists(pages[0].slug)).toBe(true);
      }
    });

    it("returns false for non-existing page", () => {
      expect(customPageExists(["non-existent-page-xyz"])).toBe(false);
    });
  });

  describe("getContentWarnings", () => {
    it("returns an array", () => {
      const warnings = getContentWarnings();
      expect(Array.isArray(warnings)).toBe(true);
    });
  });
});
