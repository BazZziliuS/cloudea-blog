"use client";

import { useEffect, useState } from "react";
import type { GeoBlock } from "@/lib/content";

interface GeoGuardProps {
  geoBlock: GeoBlock;
  children: React.ReactNode;
}

export function GeoGuard({ geoBlock, children }: GeoGuardProps) {
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://ipinfo.io?token=58e6c8d230085c")
      .then((res) => res.json())
      .then((data) => {
        if (geoBlock.countries.includes(data.country)) {
          setStatus("blocked");
          setMessage(geoBlock.message ?? "Этот контент недоступен в вашем регионе.");
        } else {
          setStatus("allowed");
        }
      })
      .catch(() => {
        setStatus("blocked");
        setMessage("Не удалось определить ваш регион. Отключите AdBlock или VPN и перезагрузите страницу.");
      });
  }, [geoBlock]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="flex items-center justify-center py-32 text-center">
        <div>
          <p className="text-4xl mb-4">⛔</p>
          <p className="text-xl text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
