import type { ReactElement } from "react";
import { compileMDX as compile } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx-components";
import { Callout } from "@/components/callout";
import { AdSlot } from "@/components/ads/ad-slot";
import { GeoHide } from "@/components/geo-hide";
import { rewriteRelativePaths, type ContentType } from "@/lib/content-assets";

export type { ContentType };

/**
 * Drop a leading `# Heading` that repeats the page title: the page header already renders it.
 * Comparison ignores case, emoji and punctuation.
 */
export function stripDuplicateTitle(source: string, title: string): string {
  const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const match = /^\s*#[ \t]+(.+?)[ \t]*#*[ \t]*(?:\r?\n|$)/.exec(source);
  if (!match || normalize(match[1]) !== normalize(title)) return source;
  return source.slice(match[0].length);
}

interface CompileOptions {
  /** Slug used to resolve co-located assets. When omitted, paths are left untouched. */
  slug?: string;
  contentType?: ContentType;
  /** Page title: a leading H1 with the same text is removed. */
  title?: string;
}

export async function compileMDX(
  source: string,
  { slug, contentType = "blog", title }: CompileOptions = {},
): Promise<ReactElement> {
  const deduplicated = title ? stripDuplicateTitle(source, title) : source;
  const processed = slug ? rewriteRelativePaths(deduplicated, slug, contentType) : deduplicated;

  const { content } = await compile({
    source: processed,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
              content: { type: "text", value: "#" },
            },
          ],
          [rehypePrettyCode, { theme: "github-dark" }],
        ],
      },
    },
    components: {
      ...mdxComponents,
      Callout,
      GeoHide,
      Ad: AdSlot,
    },
  });

  return content;
}
