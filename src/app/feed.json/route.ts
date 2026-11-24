import { FEED_CACHE_CONTROL, generateJsonFeed } from "@/lib/feed";

export function GET() {
  return Response.json(generateJsonFeed(), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8", "Cache-Control": FEED_CACHE_CONTROL },
  });
}
