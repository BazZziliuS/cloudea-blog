import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ALLOWED_ROOTS = ["blog", "docs"] as const;

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // First segment must be an allowed root (blog, docs)
  const root = segments[0] as (typeof ALLOWED_ROOTS)[number];
  if (!ALLOWED_ROOTS.includes(root)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.join(CONTENT_DIR, ...segments);

  // Security: prevent directory traversal
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(CONTENT_DIR))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Don't serve .mdx files through this route
  if (resolved.endsWith(".mdx")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const buffer = fs.readFileSync(resolved);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
