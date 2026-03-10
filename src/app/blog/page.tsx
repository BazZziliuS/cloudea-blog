import Link from "next/link";
import { getAllPosts, getAllTags, getAllYears, getPaginatedPosts } from "@/lib/content";
import { PostGrid } from "@/components/post-grid";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo, getConfig } from "@/lib/config";

export const revalidate = 3600;

export async function generateMetadata() {
  const config = getConfig();
  const ogUrl = `${config.url}/api/og?type=page&slug=blog`;
  return {
    ...seo({
      title: "Blog",
      description: "Articles, tutorials, and announcements",
      path: "/blog",
    }),
    openGraph: {
      title: "Blog",
      description: "Articles, tutorials, and announcements",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [ogUrl],
    },
  };
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.blog;
  const params = await searchParams;

  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = 12;
  const { posts, total, totalPages } = getPaginatedPosts(currentPage, perPage, false, locale);
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
            <>
              <PostGrid
                locale={locale}
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

              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  {currentPage > 1 && (
                    <Link
                      href={currentPage === 2 ? "/blog" : `/blog?page=${currentPage - 1}`}
                      className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      {locale === "ru" ? "← Назад" : "← Prev"}
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={p === 1 ? "/blog" : `/blog?page=${p}`}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        p === currentPage
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent"
                      }`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </Link>
                  ))}
                  {currentPage < totalPages && (
                    <Link
                      href={`/blog?page=${currentPage + 1}`}
                      className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      {locale === "ru" ? "Далее →" : "Next →"}
                    </Link>
                  )}
                </nav>
              )}

              {total > perPage && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {posts.length} {t.ofTotal} {total}
                </p>
              )}
            </>
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

            {total > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t.recentPosts}</h3>
                <ul className="space-y-1">
                  {getAllPosts(false, locale).slice(0, 5).map((post) => (
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
