"use client";

import type { ReactNode } from "react";
import { isGeoBlocked, useGeoCountry } from "@/hooks/use-geo-country";

interface GeoHideProps {
  countries: string[];
  children: ReactNode;
}

/**
 * MDX component: blur a fragment of content for visitors in restricted countries.
 * Labels use the site default language: MDX components don't receive the page locale.
 */
export function GeoHide({ countries, children }: GeoHideProps) {
  const geo = useGeoCountry();

  if (geo.status === "loading") return null;
  if (geo.status === "resolved" && !isGeoBlocked(geo, countries)) return <>{children}</>;

  return (
    <div className="relative my-6">
      <div className="pointer-events-none select-none blur-md" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-lg border border-border bg-card/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
          <p className="text-lg font-medium text-foreground">
            {geo.status === "error"
              ? "Не удалось определить регион. Отключите AdBlock и перезагрузите страницу."
              : "Контент скрыт в вашем регионе."}
          </p>
        </div>
      </div>
    </div>
  );
}
