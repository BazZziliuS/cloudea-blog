import type { CloudeaConfig } from "@/lib/config";

export const IPINFO_ORIGIN = "https://ipinfo.io";
const GISCUS_ORIGIN = "https://giscus.app";

const ANALYTICS_SOURCES = {
  gtag: {
    script: ["https://www.googletagmanager.com"],
    connect: ["https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com"],
    frame: [] as string[],
  },
  yandexMetrika: {
    script: ["https://mc.yandex.ru", "https://mc.yandex.com", "https://yastatic.net"],
    connect: ["https://mc.yandex.ru", "https://mc.yandex.com"],
    // Webvisor replays the page inside an iframe hosted by Metrika.
    frame: ["https://mc.yandex.ru", "https://mc.yandex.com"],
  },
};

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Build the Content-Security-Policy header value from the site config.
 *
 * Sources are derived from enabled integrations so that adding analytics or an
 * external script in `cloudea.config.ts` doesn't silently break it in production.
 */
export function buildContentSecurityPolicy(config: CloudeaConfig): string {
  const script = new Set(["'self'", "'unsafe-inline'", "'unsafe-eval'"]);
  const style = new Set(["'self'", "'unsafe-inline'"]);
  const connect = new Set(["'self'", IPINFO_ORIGIN]);
  const frame = new Set<string>();
  const img = new Set(["'self'", "data:", "blob:", "https:"]);

  const add = (target: Set<string>, values: Iterable<string | null | undefined> = []) => {
    for (const value of values) if (value) target.add(value);
  };

  if (config.comments.provider === "giscus") {
    add(script, [GISCUS_ORIGIN]);
    add(style, [GISCUS_ORIGIN]);
    add(connect, [GISCUS_ORIGIN]);
    add(frame, [GISCUS_ORIGIN]);
  }

  if (config.supabase && config.comments.provider === "supabase") {
    add(connect, [originOf(config.supabase.url)]);
  }

  for (const [key, sources] of Object.entries(ANALYTICS_SOURCES)) {
    if (!config.analytics?.[key as keyof typeof ANALYTICS_SOURCES]) continue;
    add(script, sources.script);
    add(connect, sources.connect);
    add(frame, sources.frame);
  }

  add(
    script,
    (config.customScripts ?? []).filter((s) => s.external && s.src).map((s) => originOf(s.src!)),
  );

  add(
    script,
    Object.values(config.ads?.slots ?? {}).map((slot) => originOf(slot.src)),
  );

  if (config.monetag?.tagSrc) {
    add(script, [originOf(config.monetag.tagSrc)]);
  }

  add(script, config.csp?.scriptSrc);
  add(style, config.csp?.styleSrc);
  add(connect, config.csp?.connectSrc);
  add(frame, config.csp?.frameSrc);
  add(img, config.csp?.imgSrc);

  const directives: [string, Set<string>][] = [
    ["default-src", new Set(["'self'"])],
    ["script-src", script],
    ["style-src", style],
    ["img-src", img],
    ["font-src", new Set(["'self'", "data:"])],
    ["connect-src", connect],
    ["frame-src", frame.size > 0 ? frame : new Set(["'none'"])],
    ["object-src", new Set(["'none'"])],
    ["base-uri", new Set(["'self'"])],
    ["form-action", new Set(["'self'"])],
    ["frame-ancestors", new Set(["'none'"])],
  ];

  return directives.map(([name, values]) => `${name} ${[...values].join(" ")}`).join("; ");
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  // The legacy XSS auditor is removed from modern browsers and could introduce
  // vulnerabilities in old ones; OWASP recommends disabling it explicitly.
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Sanitize a user-supplied redirect target, allowing only same-origin paths.
 * Rejects protocol-relative (`//evil.com`), backslash (`/\evil.com`), absolute URLs and
 * control characters (browsers strip tabs/newlines, turning `/\t/evil.com` into `//evil.com`).
 */
export function safeRedirectPath(target: string | null | undefined, fallback = "/"): string {
  if (
    !target ||
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(target)
  ) {
    return fallback;
  }
  return target;
}

/** Constant-time string comparison for secrets (Web Crypto–free, works on every runtime). */
export function secretsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
