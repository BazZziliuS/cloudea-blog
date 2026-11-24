import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/ad-slot";
import { BlogComments } from "@/components/blog-comments";
import { GeoGuard } from "@/components/geo-guard";
import { JsonLd } from "@/components/json-ld";
import { ShareButtons } from "@/components/share-buttons";
import { TableOfContents } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl, blogPostJsonLd, getConfig, getEditUrl, seo } from "@/lib/config";
import {
  getAllPosts,
  getPostBySlug,
  getPostLocales,
  getRelatedPosts,
  getSeriesInfo,
  type Post,
  type SeriesInfo,
} from "@/lib/content";
import { formatDate } from "@/lib/date";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { compileMDX } from "@/lib/mdx";
import { ogImageUrl } from "@/lib/og";
import { readingTimeLabel } from "@/lib/post-format";
import { isPreviewMode } from "@/lib/preview";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string[] }>;
}

function findPost(slug: string, locale?: Locale): Post | null {
  try {
    return getPostBySlug(slug, locale);
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug.split("/") }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const slug = (await params).slug.join("/");
  const post = findPost(slug);
  if (!post) return seo({ title: "Post Not Found", noIndex: true });

  const url = absoluteUrl(`/blog/${post.slug}`);
  const ogImage = ogImageUrl({ slug: post.slug });
  const meta = seo({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    article: { publishedTime: post.date, tags: post.tags },
  });

  // Translations are served from the same URL (locale is cookie-based).
  const languages = Object.fromEntries(
    [getConfig().i18n.defaultLocale, ...getPostLocales(slug), "x-default"].map((locale) => [locale, url]),
  );

  return {
    ...meta,
    alternates: { ...meta.alternates, languages },
    openGraph: { ...meta.openGraph, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { ...meta.twitter, images: [ogImage] },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const slug = (await params).slug.join("/");
  const [locale, isPreview] = await Promise.all([getLocale(), isPreviewMode()]);

  const post = findPost(slug, locale);
  if (!post || (post.draft && !isPreview)) notFound();

  const dict = getDictionary(locale);
  const t = dict.blog;
  const content = await compileMDX(post.content, { slug: post.slug });
  const relatedPosts = getRelatedPosts(post.slug, post.tags, 3, locale);
  const seriesInfo = getSeriesInfo(post, locale);
  const editUrl = getEditUrl(post.sourcePath);

  const article = (
    <>
      <JsonLd data={blogPostJsonLd(post)} />
      <div className="mx-auto flex max-w-5xl gap-10 px-6">
        <article className="min-w-0 flex-1 py-16">
          {post.draft && isPreview && (
            <div className="mb-6 rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t.draftNotice}{" "}
                <a href={`/api/preview/exit?redirect=/blog/${post.slug}`} className="underline">
                  {t.exitPreview}
                </a>
              </p>
            </div>
          )}

          <header className="mb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.date}>{formatDate(post.date, locale, "long")}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{readingTimeLabel(post.readingMinutes, locale)}</span>
              </div>
              <ShareButtons title={post.title} url={absoluteUrl(`/blog/${post.slug}`)} />
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">{post.title}</h1>
            {post.description && <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>}

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog/tags/${encodeURIComponent(tag)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {seriesInfo && <SeriesList series={seriesInfo} currentSlug={post.slug} t={t} />}

          <div className="prose prose-neutral max-w-none dark:prose-invert">{content}</div>

          <AdSlot placement="post-bottom" />

          {seriesInfo && <SeriesNavigation series={seriesInfo} currentSlug={post.slug} t={t} />}

          {editUrl && (
            <div className="mt-10 border-t border-border pt-4">
              <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ✏️ {t.editOnGithub}
              </a>
            </div>
          )}

          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} locale={locale} t={t} />}

          <BlogComments slug={post.slug} locale={locale} labels={dict.comments} />
        </article>

        <div className="hidden w-56 shrink-0 py-16 xl:block">
          <TableOfContents label={t.onThisPage} labels={dict.common} />
        </div>
      </div>
    </>
  );

  return post.geoBlock ? (
    <GeoGuard geoBlock={post.geoBlock} labels={dict.geo}>
      {article}
    </GeoGuard>
  ) : (
    article
  );
}

type BlogLabels = Dictionary["blog"];

function SeriesList({ series, currentSlug, t }: { series: SeriesInfo; currentSlug: string; t: BlogLabels }) {
  return (
    <div className="mb-8 rounded-lg border border-border bg-accent/30 p-4">
      <p className="text-sm font-semibold text-foreground">
        {t.series}: {series.name}
      </p>
      <ol className="mt-2 space-y-1 text-sm">
        {series.posts.map((item, index) => (
          <li key={item.slug} className="flex items-center gap-2">
            <span className="shrink-0 text-muted-foreground">{index + 1}.</span>
            {item.slug === currentSlug ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.title}
              </span>
            ) : (
              <Link href={`/blog/${item.slug}`} className="text-muted-foreground transition-colors hover:text-foreground">
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SeriesNavigation({ series, currentSlug, t }: { series: SeriesInfo; currentSlug: string; t: BlogLabels }) {
  const index = series.posts.findIndex((item) => item.slug === currentSlug);
  const prev = index > 0 ? series.posts[index - 1] : null;
  const next = index >= 0 && index < series.posts.length - 1 ? series.posts[index + 1] : null;
  if (!prev && !next) return null;

  return (
    <nav className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6" aria-label={t.series}>
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          rel="prev"
          className="flex flex-col text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="text-xs">{t.seriesPrev}</span>
          <span className="font-medium">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          rel="next"
          className="flex flex-col items-end text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="text-xs">{t.seriesNext}</span>
          <span className="font-medium">{next.title}</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

function RelatedPosts({ posts, locale, t }: { posts: Post[]; locale: Locale; t: BlogLabels }) {
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-lg font-semibold">{t.related}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
          >
            <p className="text-xs text-muted-foreground">{formatDate(post.date, locale)}</p>
            <h3 className="mt-1 font-medium leading-snug">{post.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
