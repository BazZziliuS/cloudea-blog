import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase().trim();

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const index = getSearchIndex();

  const results = index.filter((item) => {
    const searchable = `${item.title} ${item.description} ${item.tags?.join(" ") ?? ""} ${item.category ?? ""}`.toLowerCase();
    return query.split(/\s+/).every((word) => searchable.includes(word));
  });

  return NextResponse.json(results.slice(0, 20));
}
