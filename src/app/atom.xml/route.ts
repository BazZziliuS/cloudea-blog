import { generateAtom } from "@/lib/feed";

export function GET() {
  const atom = generateAtom();
  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
