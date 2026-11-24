import { NextResponse } from "next/server";
import { searchContent } from "@/lib/content";
import { enforceRateLimit } from "@/lib/rate-limit";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 200;

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "search", { windowMs: 60_000, max: 60 });
  if (limited) return limited;

  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) ?? "";
  if (query.length < MIN_QUERY_LENGTH) return NextResponse.json([]);

  return NextResponse.json(searchContent(query));
}
