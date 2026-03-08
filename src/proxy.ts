import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getConfig } from "@/lib/config";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
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
