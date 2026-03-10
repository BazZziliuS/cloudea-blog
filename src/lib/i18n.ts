import ruDict from "../../locales/ru.json";
import enDict from "../../locales/en.json";

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

const dictionaries: Record<Locale, typeof ruDict> = {
  ru: ruDict,
  en: enDict,
};

export type Dictionary = typeof ruDict;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
