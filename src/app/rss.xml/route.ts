import { FEED_CACHE_CONTROL, generateRss } from "@/lib/feed";

export function GET() {
  return new Response(generateRss(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": FEED_CACHE_CONTROL },
  });
}
