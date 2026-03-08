"use client";

import type { Locale } from "@/lib/i18n";

const localeNames: Record<string, string> = {
  ru: "Русский",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
};

interface PostLocaleLinkProps {
  locale: Locale;
  currentLocale: Locale;
  label?: string;
}

export function PostLocaleLink({ locale, currentLocale, label }: PostLocaleLinkProps) {
  const isActive = locale === currentLocale;

  const handleSwitch = async () => {
    const res = await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={isActive}
      className={`rounded px-2 py-0.5 transition-colors ${
        isActive
          ? "font-medium text-foreground bg-accent"
          : "hover:text-foreground hover:bg-accent/50"
      }`}
    >
      {label ?? localeNames[locale] ?? locale.toUpperCase()}
    </button>
  );
}
