import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("preview_mode");

  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/blog";
  return NextResponse.redirect(new URL(redirect, request.url));
}
