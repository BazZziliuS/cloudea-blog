import Link from "next/link";
import { getAllPosts, getAllTags, getAllYears } from "@/lib/content";
import { PostGrid } from "@/components/post-grid";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo } from "@/lib/config";

export const metadata = seo({
  title: "Blog",
  description: "Articles, tutorials, and announcements",
  path: "/blog",
});

export default async function BlogPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.blog;

  const posts = getAllPosts();
  const tags = getAllTags();
  const years = getAllYears();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex gap-10">
        <div className="min-w-0 flex-1">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">{t.noPosts}</p>
          ) : (
            <PostGrid
              posts={posts.map((post) => ({
                slug: post.slug,
                title: post.title,
                description: post.description,
                date: post.date,
                readingTime: post.readingTime,
                tags: post.tags,
                geoBlock: post.geoBlock,
              }))}
            />
          )}
        </div>

        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-8">
            {tags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{t.tags}</h3>
                  <Link
                    href="/blog/tags"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.allTagsLink} &rarr;
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/blog/tags/${tag.name}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-primary/50 hover:bg-accent"
                    >
                      <span>{tag.name}</span>
                      <span className="text-muted-foreground">({tag.count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t.recentPosts}</h3>
                <ul className="space-y-1">
                  {posts.slice(0, 5).map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent line-clamp-1"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {years.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{t.archive}</h3>
                  <Link
                    href="/blog/archive"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.allTagsLink} &rarr;
                  </Link>
                </div>
                <ul className="space-y-1">
                  {years.map(({ year, count }) => (
                    <li key={year}>
                      <Link
                        href={`/blog/archive#year-${year}`}
                        className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <span>{year}</span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
