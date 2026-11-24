import { FEED_CACHE_CONTROL, generateAtom } from "@/lib/feed";

export function GET() {
  return new Response(generateAtom(), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": FEED_CACHE_CONTROL },
  });
}
