import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { postExists } from "@/lib/content";
import { secretsEqual } from "@/lib/security";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "preview", { windowMs: 60_000, max: 10 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret") ?? "";
  const slug = searchParams.get("slug");
  const expected = process.env.PREVIEW_SECRET;

  if (!expected || !secretsEqual(secret, expected)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!slug || !postExists(slug)) {
    return NextResponse.json({ error: "Unknown slug" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  return NextResponse.redirect(new URL(`/blog/${slug}`, request.url));
}
