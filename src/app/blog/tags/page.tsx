import Link from "next/link";
import { getAllTags } from "@/lib/content";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo } from "@/lib/config";

export const metadata = seo({
  title: "Tags",
  path: "/blog/tags",
});

export default async function TagsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.blog;

  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{t.tags}</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {t.allTags} ({tags.length})
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            href={`/blog/tags/${tag.name}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <span>{tag.name}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {tag.count}
            </span>
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="mt-10 text-muted-foreground">{t.noTags}</p>
      )}
    </div>
  );
}
