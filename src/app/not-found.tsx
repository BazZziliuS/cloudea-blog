import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <h1 className="text-8xl font-extrabold tracking-tight text-muted-foreground/30">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">
        Страница не найдена
      </h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Запрашиваемая страница не существует, была удалена или перемещена по другому адресу.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/">
          <Button>На главную</Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline">Блог</Button>
        </Link>
      </div>
    </div>
  );
}
