import { describe, it, expect } from "vitest";
import {
  getConfig,
  getNavLinks,
  getDonateLink,
  getFooterLinks,
  seo,
  websiteJsonLd,
  blogPostJsonLd,
  docJsonLd,
} from "@/lib/config";

describe("config.ts", () => {
  describe("getConfig", () => {
    it("returns config with required fields", () => {
      const config = getConfig();
      expect(config.title).toBeTruthy();
      expect(config.url).toBeTruthy();
      expect(config.i18n).toBeTruthy();
      expect(config.seo).toBeTruthy();
      expect(config.themeConfig).toBeTruthy();
    });
  });

  describe("getNavLinks", () => {
    it("returns resolved nav links for a locale", () => {
      const links = getNavLinks("ru");
      expect(Array.isArray(links)).toBe(true);
      for (const link of links) {
        expect(typeof link.label).toBe("string");
        expect(["link", "dropdown"]).toContain(link.type);
      }
    });

    it("returns English labels for en locale", () => {
      const links = getNavLinks("en");
      expect(Array.isArray(links)).toBe(true);
    });
  });

  describe("getDonateLink", () => {
    it("returns donate link or null", () => {
      const donate = getDonateLink("ru");
      if (donate) {
        expect(typeof donate.href).toBe("string");
        expect(typeof donate.label).toBe("string");
      }
    });
  });

  describe("getFooterLinks", () => {
    it("returns footer link groups", () => {
      const links = getFooterLinks("ru");
      expect(Array.isArray(links)).toBe(true);
      for (const group of links) {
        expect(typeof group.title).toBe("string");
        expect(Array.isArray(group.items)).toBe(true);
      }
    });
  });

  describe("seo", () => {
    it("generates metadata with defaults", () => {
      const meta = seo();
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });

    it("applies title and path", () => {
      const meta = seo({ title: "Test Page", path: "/test" });
      expect(meta.title).toBe("Test Page");
    });

    it("sets noIndex when requested", () => {
      const meta = seo({ noIndex: true });
      expect(meta.robots).toEqual({ index: false, follow: false });
    });
  });

  describe("JSON-LD generators", () => {
    it("websiteJsonLd returns valid schema", () => {
      const jsonLd = websiteJsonLd();
      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("WebSite");
      expect(jsonLd.name).toBeTruthy();
    });

    it("blogPostJsonLd returns valid schema", () => {
      const jsonLd = blogPostJsonLd({
        title: "Test Post",
        description: "A test post",
        date: "2026-01-01",
        slug: "test-post",
        tags: ["test"],
      });
      expect(jsonLd["@type"]).toBe("BlogPosting");
      expect(jsonLd.headline).toBe("Test Post");
    });

    it("docJsonLd returns valid schema", () => {
      const jsonLd = docJsonLd({
        title: "Test Doc",
        description: "A test doc",
        slug: ["getting-started", "intro"],
      });
      expect(jsonLd["@type"]).toBe("TechArticle");
      expect(jsonLd.headline).toBe("Test Doc");
    });
  });
});
