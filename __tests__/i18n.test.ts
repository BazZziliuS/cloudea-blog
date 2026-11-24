import { describe, expect, it } from "vitest";
import { defaultLocale, getDictionary, interpolate, isLocale, locales, plural } from "@/lib/i18n";

/** Flatten dictionary keys. Plural form objects (with an `other` key) count as a single leaf. */
function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const isNested = typeof value === "object" && value !== null && !("other" in value);
    return isNested ? getKeys(value as Record<string, unknown>, fullKey) : [fullKey];
  });
}

describe("i18n.ts", () => {
  it("exports supported locales", () => {
    expect(locales).toContain("ru");
    expect(locales).toContain("en");
  });

  it("has a default locale", () => {
    expect(defaultLocale).toBe("ru");
  });

  it("isLocale validates values", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });

  it("getDictionary returns the requested dictionary", () => {
    expect(getDictionary("ru").nav.blog).toBe("Блог");
    expect(getDictionary("en").nav.blog).toBe("Blog");
    expect(getDictionary("en").footer.builtWith).toBe("Built with");
  });

  it("getDictionary falls back to the default locale", () => {
    expect(getDictionary("fr").nav.blog).toBe("Блог");
  });

  it.each(locales.filter((l) => l !== "ru"))("%s dictionary has the same keys as ru", (locale) => {
    expect(getKeys(getDictionary(locale)).sort()).toEqual(getKeys(getDictionary("ru")).sort());
  });

  describe("interpolate", () => {
    it("replaces known placeholders and keeps unknown ones", () => {
      expect(interpolate("{a} of {b} {c}", { a: 1, b: "two" })).toBe("1 of two {c}");
    });
  });

  describe("plural", () => {
    const forms = getDictionary("ru").blog.postCount;

    it.each([
      [1, "1 пост"],
      [2, "2 поста"],
      [5, "5 постов"],
      [11, "11 постов"],
      [21, "21 пост"],
      [22, "22 поста"],
      [25, "25 постов"],
    ])("ru: %i → %s", (count, expected) => {
      expect(plural("ru", count, forms)).toBe(expected);
    });

    it("en uses one/other", () => {
      const en = getDictionary("en").blog.postCount;
      expect(plural("en", 1, en)).toBe("1 post");
      expect(plural("en", 3, en)).toBe("3 posts");
    });

    it("falls back to `other` when a form is missing", () => {
      expect(plural("ru", 2, { other: "{count} x" })).toBe("2 x");
    });
  });
});
