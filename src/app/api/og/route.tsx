import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getPostBySlug } from "@/lib/content";
import { getConfig } from "@/lib/config";

const config = getConfig();

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";

  let title: string = config.title;
  let description = "";
  let tags: string[] = [];

  if (slug) {
    try {
      const post = getPostBySlug(slug);
      title = post.title;
      description = post.description;
      tags = post.tags;
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
    { width: 1200, height: 630 }
  );
}
