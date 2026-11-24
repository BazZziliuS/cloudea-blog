import { describe, expect, it } from "vitest";
import { stripDuplicateTitle } from "@/lib/mdx";

describe("stripDuplicateTitle", () => {
  it("removes a leading H1 that repeats the title", () => {
    expect(stripDuplicateTitle("# MelonLand BOT\n\n## Описание", "MelonLand BOT")).toBe("\n## Описание");
  });

  it("ignores emoji, case and punctuation", () => {
    expect(stripDuplicateTitle("# 🤖 Портфолио ботов!\ntext", "Портфолио ботов")).toBe("text");
  });

  it("keeps a different H1 and H2 headings", () => {
    expect(stripDuplicateTitle("# Другое\ntext", "Заголовок")).toBe("# Другое\ntext");
    expect(stripDuplicateTitle("## Заголовок\ntext", "Заголовок")).toBe("## Заголовок\ntext");
  });
});
