"use client";

import { useEffect, useState } from "react";

interface GeoHideProps {
  countries: string[];
  children: React.ReactNode;
}

export function GeoHide({ countries, children }: GeoHideProps) {
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked" | "error">("loading");

  useEffect(() => {
    fetch("https://ipinfo.io?token=58e6c8d230085c")
      .then((res) => res.json())
      .then((data) => {
        setStatus(countries.includes(data.country) ? "blocked" : "allowed");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [countries]);

  if (status === "loading") return null;

  if (status === "allowed") return <>{children}</>;

  return (
    <div className="relative my-6">
      <div className="pointer-events-none select-none blur-md" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-lg border border-border bg-card/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
          <p className="text-lg font-medium text-foreground">
            {status === "error"
              ? "Не удалось определить регион. Отключите AdBlock и перезагрузите страницу."
              : "Контент скрыт в вашем регионе."}
          </p>
        </div>
      </div>
    </div>
  );
}
