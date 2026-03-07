import { generateRss } from "@/lib/feed";

export function GET() {
  const rss = generateRss();
  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
