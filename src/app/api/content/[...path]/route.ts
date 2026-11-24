import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ALLOWED_ROOTS = new Set(["blog", "docs", "projects"]);

/** Allow-list of servable asset types; source files (.md/.mdx) are never exposed. */
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

const notFound = () => new Response("Not Found", { status: 404 });

export async function GET(_request: Request, { params }: RouteContext<"/api/content/[...path]">) {
  const { path: segments } = await params;
  if (!ALLOWED_ROOTS.has(segments[0])) return notFound();

  const resolved = path.resolve(CONTENT_DIR, ...segments);
  // Directory traversal guard. The trailing separator prevents `content-evil/` from matching.
  if (!resolved.startsWith(CONTENT_DIR + path.sep)) return notFound();

  const contentType = MIME_TYPES[path.extname(resolved).toLowerCase()];
  if (!contentType) return notFound();

  try {
    const data = await fs.readFile(resolved);
    return new Response(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        // SVGs may contain scripts; sandbox them when opened directly.
        ...(contentType === "image/svg+xml" ? { "Content-Security-Policy": "script-src 'none'; sandbox" } : {}),
      },
    });
  } catch {
    return notFound();
  }
}
