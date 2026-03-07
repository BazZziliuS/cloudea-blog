import { generateJsonFeed } from "@/lib/feed";

export function GET() {
  const feed = generateJsonFeed();
  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
