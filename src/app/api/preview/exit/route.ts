import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeRedirectPath } from "@/lib/security";
import { PREVIEW_COOKIE } from "@/lib/preview";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(PREVIEW_COOKIE);

  const redirect = safeRedirectPath(new URL(request.url).searchParams.get("redirect"), "/blog");
  return NextResponse.redirect(new URL(redirect, request.url));
}
