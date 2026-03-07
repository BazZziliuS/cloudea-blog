import { compileMDX as compile } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx-components";
import React from "react";
import type { ReactElement } from "react";
import { Callout } from "@/components/callout";
import { CodeBlockWrapper } from "@/components/copy-button";

/**
 * Rewrite relative image/link paths in MDX content to point to the content API.
 * E.g., `./screenshot.png` → `/api/content/2025/05-17-n8n/screenshot.png`
 */
function rewriteRelativePaths(source: string, slug?: string): string {
  if (!slug) return source;

  const assetBase = `/api/content/${slug}`;

  return source
    // Markdown images: ![alt](./image.png) or ![alt](image.png)
    .replace(
      /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
      `![$1](${assetBase}/$2)`
    )
    .replace(
      /!\[([^\]]*)\]\((?!https?:\/\/|\/|#)([^)]+)\)/g,
      `![$1](${assetBase}/$2)`
    )
    // HTML img src: src="./image.png" or src="image.png"
    .replace(
      /src="\.\/([^"]+)"/g,
      `src="${assetBase}/$1"`
    )
    .replace(
      /src="(?!https?:\/\/|\/|#)([^"]+)"/g,
      `src="${assetBase}/$1"`
    );
}

export async function compileMDX(
  source: string,
  slug?: string
): Promise<ReactElement> {
  const processed = rewriteRelativePaths(source, slug);

  const { content } = await compile({
    source: processed,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { behavior: "wrap" },
          ],
          [
            rehypePrettyCode,
            { theme: "github-dark" },
          ],
        ],
      },
      parseFrontmatter: false,
    },
    components: {
      ...mdxComponents,
      Callout,
      figure: (props: React.ComponentPropsWithoutRef<"figure">) => {
        // rehype-pretty-code wraps code blocks in <figure data-rehype-pretty-code-figure>
        if ((props as Record<string, unknown>)["data-rehype-pretty-code-figure"] !== undefined) {
          return <CodeBlockWrapper {...props} />;
        }
        return <figure {...props} />;
      },
    },
  });

  return content;
}
