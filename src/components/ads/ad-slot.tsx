import { getAdSlot, type AdPlacement } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ScriptWidget } from "./script-widget";

/**
 * Ad block for a placement configured in `cloudea.config.ts → ads.slots`.
 * Renders nothing when the placement is not configured.
 *
 * In MDX: `<Ad />` renders the `inline` placement.
 */
export async function AdSlot({ placement = "inline" }: { placement?: AdPlacement }) {
  const locale = await getLocale();
  const slot = getAdSlot(placement, locale, getDictionary(locale).common.advertisement);
  if (!slot) return null;

  return <ScriptWidget key={slot.src} src={slot.src} label={slot.label} minHeight={slot.minHeight} />;
}
