import { describe, expect, it } from "vitest";
import { rewriteRelativePaths } from "@/lib/content-assets";
import { escapeXml, generateAtom, generateJsonFeed, generateRss, markdownToHtml } from "@/lib/feed";

describe("markdownToHtml", () => {
  it("does not apply inline formatting inside code blocks", () => {
    const html = markdownToHtml("```bash\n# comment\necho **x** <b>\n```");
    expect(html).toContain("<pre><code># comment\necho **x** &lt;b&gt;</code></pre>");
    expect(html).not.toContain("<h1>");
  });

  it("converts headings, emphasis, links and images", () => {
    const html = markdownToHtml("## Title\n\nSome **bold** and *em* [link](https://a.b) ![alt](/img.png)");
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>em</em>");
    expect(html).toContain('<a href="https://a.b">link</a>');
    expect(html).toContain('<img src="/img.png" alt="alt"/>');
  });

  it("strips MDX imports and self-closing components but keeps component children", () => {
    const html = markdownToHtml('import X from "y";\n\n<Banner />\n\n<Callout type="info">Hello</Callout>');
    expect(html).not.toContain("import");
    expect(html).not.toContain("Banner");
    expect(html).toContain("Hello");
  });
});

describe("feeds", () => {
  it("produce well-formed documents", () => {
    expect(generateRss()).toMatch(/^<\?xml[\s\S]*<\/rss>$/);
    expect(generateAtom()).toMatch(/^<\?xml[\s\S]*<\/feed>$/);
    expect(generateJsonFeed().version).toBe("https://jsonfeed.org/version/1.1");
  });

  it("never contains relative content asset paths", () => {
    expect(generateRss()).not.toMatch(/src="\/api\/content/);
  });

  it("escapeXml escapes special characters", () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;");
  });
});

describe("rewriteRelativePaths", () => {
  const rewrite = (source: string) => rewriteRelativePaths(source, "2025/post", "blog");

  it("rewrites relative markdown and JSX image paths", () => {
    expect(rewrite("![a](./img.png)")).toBe("![a](/api/content/blog/2025/post/img.png)");
    expect(rewrite("![a](img.png)")).toBe("![a](/api/content/blog/2025/post/img.png)");
    expect(rewrite('<img src="./img.png" />')).toBe('<img src="/api/content/blog/2025/post/img.png" />');
  });

  it("leaves absolute, root-relative and data URLs untouched", () => {
    for (const source of ["![a](https://x.y/i.png)", "![a](/i.png)", 'src="data:image/png;base64,AAA"']) {
      expect(rewrite(source)).toBe(source);
    }
  });
});
