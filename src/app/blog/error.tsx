"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <h1 className="text-2xl font-bold tracking-tight">Не удалось загрузить страницу</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        При загрузке контента произошла ошибка. Попробуйте обновить страницу.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Попробовать снова</Button>
        <Button variant="outline" asChild>
          <Link href="/blog">К блогу</Link>
        </Button>
      </div>
    </div>
  );
}
