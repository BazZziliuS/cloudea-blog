import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getConfig } from "@/lib/config";

const SUPPORTED_LOCALES = ["ru", "en"];
const DEFAULT_LOCALE = "ru";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qStr] = lang.trim().split(";q=");
      return { code: code.split("-")[0].toLowerCase(), q: qStr ? parseFloat(qStr) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang.code)) {
      return lang.code;
    }
  }

  return DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // Security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Auto-detect locale from Accept-Language if no cookie set
  if (!request.cookies.has("locale")) {
    const locale = getPreferredLocale(request);
    response.cookies.set("locale", locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
    });
  }

  // Content-Security-Policy
  const config = getConfig();
  const supabaseUrl = config.supabase?.url ?? "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giscus.app`,
    `style-src 'self' 'unsafe-inline' https://giscus.app`,
    `img-src 'self' data: blob: https: http:`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' ${supabaseUrl} https://ipinfo.io https://giscus.app`,
    `frame-src https://giscus.app`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
