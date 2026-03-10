import Link from "next/link";
import { format } from "date-fns";
import { getAllPosts, getAllYears } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo } from "@/lib/config";

export const revalidate = 3600;

export const metadata = seo({
  title: "Archive",
  path: "/blog/archive",
});

export default async function ArchivePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.blog;

  const years = getAllYears();
  const posts = getAllPosts();

  const postsByYear = new Map<number, typeof posts>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    if (!postsByYear.has(year)) postsByYear.set(year, []);
    postsByYear.get(year)!.push(post);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{t.archive}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t.archiveSubtitle}</p>

      <div className="mt-10 space-y-12">
        {years.map(({ year, count }) => (
          <section key={year} id={`year-${year}`}>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{year}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
                {count}
              </span>
            </div>

            <div className="space-y-4 border-l-2 border-border pl-6">
              {postsByYear.get(year)?.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <div className="flex items-baseline gap-4">
                    <time
                      dateTime={post.date}
                      className="shrink-0 text-sm tabular-nums text-muted-foreground"
                    >
                      {format(new Date(post.date), "dd.MM")}
                    </time>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
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

      {years.length === 0 && (
        <p className="mt-10 text-muted-foreground">{t.noPosts}</p>
      )}
    </div>
  );
}
