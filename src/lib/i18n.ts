import { getConfig } from "./config";

import ruDict from "../../locales/ru.json";
import enDict from "../../locales/en.json";
import zhDict from "../../locales/zh.json";

const config = getConfig();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allDictionaries: Record<string, any> = { ru: ruDict, en: enDict, zh: zhDict };

export const locales = config.i18n.locales as readonly string[];
export type Locale = (typeof locales)[number];
export const defaultLocale = config.i18n.defaultLocale as Locale;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;

export function getDictionary(locale: Locale): Dictionary {
  return allDictionaries[locale] ?? allDictionaries[defaultLocale] ?? {};
}
