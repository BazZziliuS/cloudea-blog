import { type NextRequest, NextResponse } from "next/server";
import { getConfig, isSupabaseAuthEnabled } from "@/lib/config";
import { defaultLocale, isLocale, locales, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { buildContentSecurityPolicy, SECURITY_HEADERS } from "@/lib/security";
import { updateSession } from "@/lib/supabase/middleware";

const CONTENT_SECURITY_POLICY = buildContentSecurityPolicy(getConfig());
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Pick the best supported locale from the Accept-Language header. */
export function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { code: tag.split("-")[0].toLowerCase(), q: q ? Number.parseFloat(q.trim().slice(2)) || 0 : 1 };
    })
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q);

  return candidates.find(({ code }) => locales.includes(code))?.code ?? defaultLocale;
}

export async function proxy(request: NextRequest) {
  // First visit: detect the locale and expose it to this very request too,
  // so the initial render already uses the visitor's language.
  const detectedLocale = isLocale(request.cookies.get(LOCALE_COOKIE)?.value)
    ? null
    : getPreferredLocale(request.headers.get("accept-language"));
  if (detectedLocale) request.cookies.set(LOCALE_COOKIE, detectedLocale);

  // Refreshing the Supabase session costs a network round-trip, so only do it
  // when Supabase auth is actually in use.
  const response = isSupabaseAuthEnabled() ? await updateSession(request) : NextResponse.next({ request });

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);

  if (detectedLocale) {
    response.cookies.set(LOCALE_COOKIE, detectedLocale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif)$).*)",
  ],
};
