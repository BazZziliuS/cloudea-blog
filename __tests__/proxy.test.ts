import { describe, expect, it } from "vitest";
import { getPreferredLocale } from "@/proxy";

describe("getPreferredLocale", () => {
  it.each([
    [null, "ru"],
    ["en-US,en;q=0.9", "en"],
    ["de-DE,de;q=0.9,en;q=0.8", "en"],
    ["fr-FR, zh-CN;q=0.5, en;q=0.4", "zh"],
    ["en;q=0, ru;q=0.1", "ru"],
    ["xx", "ru"],
  ])("%s → %s", (header, expected) => {
    expect(getPreferredLocale(header)).toBe(expected);
  });
});
