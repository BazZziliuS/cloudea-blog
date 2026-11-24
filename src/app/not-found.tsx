import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default async function NotFound() {
  const dict = getDictionary(await getLocale());

  return (
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-8xl font-extrabold tracking-tight text-muted-foreground/30" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{dict.errors.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{dict.errors.notFoundText}</p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">{dict.common.home}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/blog">{dict.blog.title}</Link>
        </Button>
      </div>
    </div>
  );
}
