import { describe, it, expect } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rate-limit.ts", () => {
  it("allows requests within limit", () => {
    const result = rateLimit("test-allow", { windowMs: 10_000, max: 5 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding limit", () => {
    const key = "test-block-" + Date.now();
    for (let i = 0; i < 3; i++) {
      rateLimit(key, { windowMs: 10_000, max: 3 });
    }
    const result = rateLimit(key, { windowMs: 10_000, max: 3 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("getClientIp extracts from x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("getClientIp falls back to x-real-ip", () => {
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(getClientIp(request)).toBe("9.8.7.6");
  });

  it("getClientIp returns unknown when no headers", () => {
    const request = new Request("http://localhost");
    expect(getClientIp(request)).toBe("unknown");
  });
});
