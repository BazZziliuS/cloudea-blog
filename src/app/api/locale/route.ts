import { NextResponse } from "next/server";
import { locales, type Locale } from "@/lib/i18n";

export async function POST(request: Request) {
  const { locale } = await request.json();

  if (!locales.includes(locale as Locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
