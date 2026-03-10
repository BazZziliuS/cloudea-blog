import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("preview_mode", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return NextResponse.redirect(new URL(`/blog/${slug}`, request.url));
}
