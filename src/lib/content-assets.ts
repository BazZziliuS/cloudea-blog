export type ContentType = "blog" | "docs";

/** Paths that must not be rewritten: absolute URLs, root-relative paths, anchors, data/mailto URIs. */
const ABSOLUTE_REF = String.raw`(?!https?:\/\/|\/|#|data:|mailto:)`;

const MARKDOWN_IMAGE_RE = new RegExp(String.raw`!\[([^\]]*)\]\(${ABSOLUTE_REF}(?:\.\/)?([^)]+)\)`, "g");
const SRC_ATTRIBUTE_RE = new RegExp(String.raw`src="${ABSOLUTE_REF}(?:\.\/)?([^"]+)"`, "g");

/**
 * Rewrite relative image paths in Markdown/MDX source so co-located assets are
 * served through the content API.
 *
 * `./screenshot.png` → `/api/content/blog/2025/05-17-n8n/screenshot.png`
 */
export function rewriteRelativePaths(source: string, slug: string, contentType: ContentType): string {
  const assetBase = `/api/content/${contentType}/${slug}`;
  return source
    .replace(MARKDOWN_IMAGE_RE, `![$1](${assetBase}/$2)`)
    .replace(SRC_ATTRIBUTE_RE, `src="${assetBase}/$1"`);
}
