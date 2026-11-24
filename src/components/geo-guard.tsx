"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import type { GeoBlock } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";
import { isGeoBlocked, useGeoCountry } from "@/hooks/use-geo-country";

interface GeoGuardProps {
  geoBlock: GeoBlock;
  labels: Dictionary["geo"];
  children: ReactNode;
}

/** Hide a whole page from visitors in restricted countries (fails closed). */
export function GeoGuard({ geoBlock, labels, children }: GeoGuardProps) {
  const geo = useGeoCountry();

  if (geo.status === "loading") {
    return (
      <div className="flex items-center justify-center py-32" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (geo.status === "error" || isGeoBlocked(geo, geoBlock.countries)) {
    const message = geo.status === "error" ? labels.detectFailed : (geoBlock.message ?? labels.unavailable);
    return (
      <div className="flex items-center justify-center px-6 py-32 text-center">
        <div>
          <Lock className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-xl text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
