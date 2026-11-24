"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { CloudeaConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";

type GiscusConfig = NonNullable<CloudeaConfig["comments"]["giscus"]>;

const GISCUS_ORIGIN = "https://giscus.app";

export function GiscusComments({ config, locale }: { config: GiscusConfig; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  // Theme at mount time; later changes are pushed to the iframe via postMessage
  // instead of reloading the whole widget.
  const initialTheme = useRef(theme);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";

    const attributes: Record<string, string> = {
      "data-repo": config.repo,
      "data-repo-id": config.repoId,
      "data-category": config.category,
      "data-category-id": config.categoryId,
      "data-mapping": config.mapping,
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": initialTheme.current,
      "data-lang": locale,
      "data-loading": "lazy",
    };
    for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);

    container.appendChild(script);
    return () => container.replaceChildren();
  }, [config, locale]);

  useEffect(() => {
    const iframe = ref.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, GISCUS_ORIGIN);
  }, [theme]);

  return <div ref={ref} className="mt-16 border-t border-border pt-10" />;
}
