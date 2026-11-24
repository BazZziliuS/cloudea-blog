import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllPosts } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const RECENT_POSTS = 4;

export default async function NotFound() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const recent = getAllPosts(false, locale).slice(0, RECENT_POSTS);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="font-mono text-6xl font-medium tabular-nums text-muted-foreground/40" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{dict.errors.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{dict.errors.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">{dict.common.home}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/projects">{dict.projects.title}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/docs">{dict.docs.title}</Link>
        </Button>
      </div>

      {recent.length > 0 && (
        <section className="mt-14 w-full text-left">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {dict.errors.tryLatest}
          </h2>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {recent.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <span className="font-medium">{post.title}</span>
                  <time dateTime={post.date} className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(post.date, locale)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
