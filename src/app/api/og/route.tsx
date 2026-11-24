import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getConfig } from "@/lib/config";
import { getCustomPage, getDocBySlug, getPostBySlug, getProjectBySlug } from "@/lib/content";
import { OG_IMAGE_SIZE } from "@/lib/og";
import { humanizeSlug } from "@/lib/utils";

const config = getConfig();
const MAX_SLUG_LENGTH = 300;

export async function GET(request: NextRequest) {
  const slug = (request.nextUrl.searchParams.get("slug") ?? "").slice(0, MAX_SLUG_LENGTH);
  const type = request.nextUrl.searchParams.get("type") ?? "blog";

  let title: string = config.title;
  let description = "";
  let tags: string[] = [];
  let category = "";

  if (slug) {
    try {
      if (type === "doc") {
        const doc = getDocBySlug(slug.split("/"));
        title = doc.title;
        description = doc.description;
        category = doc.category;
      } else if (type === "project") {
        const project = getProjectBySlug(slug);
        title = project.title;
        description = project.description;
        tags = project.stack.slice(0, 5);
      } else if (type === "page") {
        try {
          const page = getCustomPage(slug.split("/"));
          title = page.title;
          description = page.description;
        } catch {
          // Not a custom page (e.g. "blog", "docs") — derive the title from the slug.
          title = humanizeSlug(slug);
          description = config.tagline;
        }
      } else {
        const post = getPostBySlug(slug);
        title = post.title;
        description = post.description;
        tags = post.tags;
      }
    } catch {
      // fallback to defaults
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {category && (
            <span
              style={{
                fontSize: 18,
                color: "#4fd0ff",
                marginBottom: 12,
              }}
            >
              {category}
            </span>
          )}
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              maxWidth: "90%",
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: 24,
                color: "#a1a1aa",
                marginTop: 20,
                maxWidth: "80%",
              }}
            >
              {description}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 16,
                  color: "#d4d4d8",
                  backgroundColor: "#27272a",
                  padding: "6px 14px",
                  borderRadius: 6,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 20, color: "#71717a" }}>{config.title}</span>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
