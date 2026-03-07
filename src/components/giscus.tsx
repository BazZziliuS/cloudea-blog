"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { getConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";

export function GiscusComments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const giscus = getConfig().comments.giscus;

  useEffect(() => {
    if (!ref.current || !giscus?.repo) return;

    const existing = ref.current.querySelector("iframe.giscus-frame");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", giscus.repo);
    script.setAttribute("data-repo-id", giscus.repoId);
    script.setAttribute("data-category", giscus.category);
    script.setAttribute("data-category-id", giscus.categoryId);
    script.setAttribute("data-mapping", giscus.mapping);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", resolvedTheme === "dark" ? "dark" : "light");
    script.setAttribute("data-lang", locale);
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);
  }, [resolvedTheme, locale, giscus]);

  if (!giscus?.repo) return null;

  return <div ref={ref} className="mt-16 border-t border-border pt-10" />;
}
