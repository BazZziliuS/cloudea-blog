import { getConfig } from "@/lib/config";

/**
 * Monetag push service worker, generated from cloudea.config.ts `monetag` section.
 * When `monetag.swZoneId` / `monetag.swDomain` are not configured, returns an empty SW
 * so the route still resolves cleanly (useful if a previous deploy registered one).
 */
export function GET() {
  const { monetag } = getConfig();

  const body =
    monetag?.swDomain && monetag.swZoneId
      ? `self.options = {
    "domain": ${JSON.stringify(monetag.swDomain)},
    "zoneId": ${JSON.stringify(monetag.swZoneId)}
};
self.lary = "";
importScripts('https://${monetag.swDomain}/act/files/service-worker.min.js?r=sw');
`
      : `// Monetag service worker is not configured. See cloudea.config.ts → monetag.\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-store",
    },
  });
}
