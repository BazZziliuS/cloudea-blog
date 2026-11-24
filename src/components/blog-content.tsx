import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { PostGrid } from "@/components/post-grid";
import { Button } from "@/components/ui/button";
import { getAllPosts, getAllTags, getAllYears, getPaginatedPosts } from "@/lib/content";
import type { Dictionary, Locale } from "@/lib/i18n";
import { toPostCardData } from "@/lib/post-format";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 12;
const SIDEBAR_TAG_LIMIT = 15;
const SIDEBAR_RECENT_LIMIT = 5;

interface BlogContentProps {
  locale: Locale;
  dict: Dictionary;
  currentPage: number;
  basePath?: string;
}

function pageHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  return `${basePath}?page=${page}`;
}

export function BlogContent({ locale, dict, currentPage, basePath = "/blog" }: BlogContentProps) {
  const t = dict.blog;
  const { posts, totalPages } = getPaginatedPosts(currentPage, POSTS_PER_PAGE, locale);
  const recentPosts = getAllPosts(false, locale).slice(0, SIDEBAR_RECENT_LIMIT);
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
                posts={posts.map((post) => toPostCardData(post, locale))}
                labels={{ showMore: t.showMore, shownOf: t.shownOf, unavailableShort: dict.geo.unavailableShort }}
                perPage={POSTS_PER_PAGE}
              />

              <AdSlot placement="blog-list" />

              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  {currentPage > 1 && (
                    <Button variant="outline" asChild>
                      <Link href={pageHref(basePath, currentPage - 1)} rel="prev">
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        {t.prev}
                      </Link>
                    </Button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={pageHref(basePath, page)}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm tabular-nums transition-colors",
                        page === currentPage
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      {page}
                    </Link>
                  ))}
                  {currentPage < totalPages && (
                    <Button variant="outline" asChild>
                      <Link href={pageHref(basePath, currentPage + 1)} rel="next">
                        {t.next}
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </nav>
              )}
            </>
          )}
        </div>

        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-8">
            {tags.length > 0 && (
              <SidebarSection title={t.tags} moreHref="/blog/tags" moreLabel={t.allTagsLink}>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, SIDEBAR_TAG_LIMIT).map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/blog/tags/${encodeURIComponent(tag.name)}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-primary/50 hover:bg-accent"
                    >
                      <span>{tag.name}</span>
                      <span className="text-muted-foreground">({tag.count})</span>
                    </Link>
                  ))}
                </div>
              </SidebarSection>
            )}

            {recentPosts.length > 0 && (
              <SidebarSection title={t.recentPosts}>
                <ul className="space-y-1">
                  {recentPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="line-clamp-1 block rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </SidebarSection>
            )}

            {years.length > 0 && (
              <SidebarSection title={t.archive} moreHref="/blog/archive" moreLabel={t.fullArchive}>
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
              </SidebarSection>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  moreHref,
  moreLabel,
  children,
}: {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {moreHref && (
          <Link href={moreHref} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            {moreLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
