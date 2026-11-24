import { describe, expect, it } from "vitest";
import type { CloudeaConfig } from "@/lib/config";
import { getConfig } from "@/lib/config";
import { buildContentSecurityPolicy, safeRedirectPath, secretsEqual } from "@/lib/security";

function directive(csp: string, name: string): string[] {
  const entry = csp.split("; ").find((d) => d.startsWith(`${name} `));
  return entry ? entry.split(" ").slice(1) : [];
}

const baseConfig = getConfig();

function withConfig(overrides: Partial<CloudeaConfig>): CloudeaConfig {
  return { ...baseConfig, customScripts: [], csp: undefined, analytics: undefined, monetag: undefined, ads: undefined, ...overrides };
}

describe("buildContentSecurityPolicy", () => {
  it("adds analytics hosts when analytics is configured", () => {
    const csp = buildContentSecurityPolicy(withConfig({ analytics: { yandexMetrika: "123" } }));
    expect(directive(csp, "script-src")).toContain("https://mc.yandex.ru");
    expect(directive(csp, "connect-src")).toContain("https://mc.yandex.ru");
  });

  it("omits analytics hosts when analytics is disabled", () => {
    const csp = buildContentSecurityPolicy(withConfig({}));
    expect(directive(csp, "script-src")).not.toContain("https://mc.yandex.ru");
  });

  it("allows origins of external custom scripts", () => {
    const csp = buildContentSecurityPolicy(
      withConfig({ customScripts: [{ src: "https://cdn.example.com/a/b.js?x=1", external: true }] }),
    );
    expect(directive(csp, "script-src")).toContain("https://cdn.example.com");
  });

  it("allows origins of ad slot widgets", () => {
    const csp = buildContentSecurityPolicy(
      withConfig({ ads: { slots: { "post-bottom": { src: "https://widgets.example/w.js?id=1" } } } }),
    );
    expect(directive(csp, "script-src")).toContain("https://widgets.example");
  });

  it("merges explicit csp sources", () => {
    const csp = buildContentSecurityPolicy(withConfig({ csp: { frameSrc: ["https://video.example"] } }));
    expect(directive(csp, "frame-src")).toContain("https://video.example");
  });

  it("allows giscus only when it is the comments provider", () => {
    const giscus = buildContentSecurityPolicy(withConfig({ comments: { provider: "giscus" } }));
    const none = buildContentSecurityPolicy(withConfig({ comments: { provider: "none" } }));
    expect(directive(giscus, "frame-src")).toContain("https://giscus.app");
    expect(directive(none, "frame-src")).toEqual(["'none'"]);
  });

  it("matches the production config: Travelpayouts widgets are allowed", () => {
    const csp = buildContentSecurityPolicy(baseConfig);
    expect(directive(csp, "script-src")).toContain("https://tpwdg.com");
  });
});

describe("safeRedirectPath", () => {
  it.each(["/", "/blog/post", "/docs?x=1#a"])("allows same-origin path %s", (path) => {
    expect(safeRedirectPath(path)).toBe(path);
  });

  it.each([
    null,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "@evil.com",
    "javascript:alert(1)",
    "/\t/evil.com",
  ])("rejects %s", (target) => {
    expect(safeRedirectPath(target, "/fallback")).toBe("/fallback");
  });
});

describe("secretsEqual", () => {
  it("compares strings", () => {
    expect(secretsEqual("abc", "abc")).toBe(true);
    expect(secretsEqual("abc", "abd")).toBe(false);
    expect(secretsEqual("abc", "abcd")).toBe(false);
  });
});
