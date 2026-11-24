import config from "../../cloudea.config";
import ru from "../../locales/ru.json";
import en from "../../locales/en.json";
import zh from "../../locales/zh.json";

/** Dictionary shape is defined by the default (Russian) locale file. */
export type Dictionary = typeof ru;

export type Locale = string;

export const locales: readonly Locale[] = config.i18n.locales;
export const defaultLocale: Locale = config.i18n.defaultLocale;

export const LOCALE_COOKIE = "locale";

/** Native display names used by the language switcher. */
export const localeNames: Record<string, string> = {
  ru: "Русский",
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  ar: "العربية",
  hi: "हिन्दी",
  tr: "Türkçe",
  pl: "Polski",
  uk: "Українська",
};

// Locale files are checked for key parity in __tests__/i18n.test.ts.
const dictionaries: Record<string, Dictionary> = {
  ru,
  en: en as Dictionary,
  zh: zh as Dictionary,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale] ?? ru;
}

/** Replace `{name}` placeholders with values. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * Pick the CLDR plural form for `count` and interpolate `{count}`.
 *
 * @example plural("ru", 21, dict.blog.postCount) // "21 пост"
 */
export function plural(locale: Locale, count: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(locale).select(count) as keyof PluralForms;
  return interpolate(forms[category] ?? forms.other, { count });
}
