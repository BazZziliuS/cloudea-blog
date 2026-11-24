import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { seo } from "@/lib/config";
import { getAllPosts, type Post } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = getDictionary(await getLocale());
  return seo({ title: blog.archive, description: blog.archiveSubtitle, path: "/blog/archive" });
}

function groupByYear(posts: Post[]): [number, Post[]][] {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups].sort(([a], [b]) => b - a);
}

export default async function ArchivePage() {
  const locale = await getLocale();
  const t = getDictionary(locale).blog;
  const years = groupByYear(getAllPosts(false, locale));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{t.archive}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t.archiveSubtitle}</p>

      {years.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.noPosts}</p>
      ) : (
        <div className="mt-10 space-y-12">
          {years.map(([year, posts]) => (
            <section key={year} id={`year-${year}`} aria-labelledby={`year-${year}-heading`}>
              <div className="mb-6 flex items-center gap-3">
                <h2 id={`year-${year}-heading`} className="text-2xl font-bold">
                  {year}
                </h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
                  {posts.length}
                </span>
              </div>

              <div className="space-y-4 border-l-2 border-border pl-6">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <div className="flex items-baseline gap-4">
                      <time dateTime={post.date} className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        {formatDate(post.date, locale, "dayMonth")}
                      </time>
                      <div>
                        <h3 className="font-medium transition-colors group-hover:text-primary">{post.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
