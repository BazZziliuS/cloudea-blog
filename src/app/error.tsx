"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <h1 className="text-8xl font-extrabold tracking-tight text-muted-foreground/30">
        500
      </h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">
        Что-то пошло не так
      </h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground/60">
          ID: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Попробовать снова</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          На главную
        </Button>
      </div>
    </div>
  );
}
