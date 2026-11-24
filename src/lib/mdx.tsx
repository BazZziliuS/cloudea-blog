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

interface CompileOptions {
  /** Slug used to resolve co-located assets. When omitted, paths are left untouched. */
  slug?: string;
  contentType?: ContentType;
}

export async function compileMDX(
  source: string,
  { slug, contentType = "blog" }: CompileOptions = {},
): Promise<ReactElement> {
  const processed = slug ? rewriteRelativePaths(source, slug, contentType) : source;

  const { content } = await compile({
    source: processed,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
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
