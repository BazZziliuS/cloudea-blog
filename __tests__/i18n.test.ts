import { describe, it, expect } from "vitest";
import { getDictionary, locales, defaultLocale } from "@/lib/i18n";

describe("i18n.ts", () => {
  it("exports supported locales", () => {
    expect(locales).toContain("ru");
    expect(locales).toContain("en");
  });

  it("has a default locale", () => {
    expect(defaultLocale).toBe("ru");
  });

  it("getDictionary returns ru dictionary", () => {
    const dict = getDictionary("ru");
    expect(dict.nav.blog).toBe("Блог");
    expect(dict.footer.builtWith).toBe("Сделано на");
  });

  it("getDictionary returns en dictionary", () => {
    const dict = getDictionary("en");
    expect(dict.nav.blog).toBe("Blog");
    expect(dict.footer.builtWith).toBe("Built with");
  });

  it("getDictionary falls back to default for unknown locale", () => {
    // @ts-expect-error testing invalid locale
    const dict = getDictionary("fr");
    expect(dict.nav.blog).toBe("Блог");
  });

  it("all dictionary keys match between locales", () => {
    const ru = getDictionary("ru");
    const en = getDictionary("en");

    function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      const keys: string[] = [];
      for (const [key, val] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof val === "object" && val !== null) {
          keys.push(...getKeys(val as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }

    const ruKeys = getKeys(ru).sort();
    const enKeys = getKeys(en).sort();
    expect(ruKeys).toEqual(enKeys);
  });
});
