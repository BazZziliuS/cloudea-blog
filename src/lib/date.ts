import { format } from "date-fns";
import { enUS, ru, zhCN, type Locale as DateFnsLocale } from "date-fns/locale";
import type { Locale } from "@/lib/i18n";

const dateFnsLocales: Record<string, DateFnsLocale> = { ru, en: enUS, zh: zhCN };

export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  return dateFnsLocales[locale] ?? enUS;
}

export const DATE_FORMATS = {
  long: "d MMMM yyyy",
  medium: "d MMM yyyy",
  dayMonth: "d MMM",
} as const;

export function formatDate(
  date: string | Date,
  locale: Locale,
  pattern: keyof typeof DATE_FORMATS = "medium",
): string {
  return format(new Date(date), DATE_FORMATS[pattern], { locale: getDateFnsLocale(locale) });
}
