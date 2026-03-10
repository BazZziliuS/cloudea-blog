import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ru, enUS, zhCN } from "date-fns/locale";

const dateLocales: Record<string, import("date-fns").Locale> = { ru, en: enUS, zh: zhCN };
const readingTimeLabels: Record<string, string> = { ru: "мин чтения", en: "min read", zh: "分钟阅读" };
import Link from "next/link";
import { getAllPosts, getPostBySlug, getRelatedPosts, isDirectoryPost, getPostLocales, getSeriesInfo } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { BlogComments } from "@/components/blog-comments";
import { GeoGuard } from "@/components/geo-guard";
import { getLocale } from "@/lib/i18n-server";
import { ShareButtons } from "@/components/share-buttons";
import { seo, blogPostJsonLd, getConfig } from "@/lib/config";
import { cookies } from "next/headers";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug.split("/") }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const joined = slug.join("/");
  try {
    const post = getPostBySlug(joined);
    const config = getConfig();
    const ogUrl = `${config.url}/api/og?slug=${encodeURIComponent(post.slug)}`;
    const postLocales = getPostLocales(joined);
    const meta = seo({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      type: "article",
      article: {
        publishedTime: post.date,
        tags: post.tags,
      },
    });

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    languages[config.i18n.defaultLocale] = `${config.url}/blog/${post.slug}`;
    for (const loc of postLocales) {
      languages[loc] = `${config.url}/blog/${post.slug}`;
    }
    languages["x-default"] = `${config.url}/blog/${post.slug}`;

    return {
      ...meta,
      alternates: {
        ...meta.alternates,
        languages,
      },
      openGraph: {
        ...meta.openGraph,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        ...meta.twitter,
        images: [ogUrl],
      },
    };
  } catch {
    return seo({ title: "Post Not Found", noIndex: true });
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const joined = slug.join("/");

  const locale = await getLocale();
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("preview_mode")?.value === "true";

  let post;
  try {
    post = getPostBySlug(joined, locale);
  } catch {
    notFound();
  }

  // Block access to drafts unless in preview mode
  if (post.draft && !isPreview) {
    notFound();
  }

  const content = await compileMDX(post.content, post.slug);
  const jsonLd = blogPostJsonLd(post);
  const config = getConfig();
  const relatedPosts = getRelatedPosts(post.slug, post.tags, 3, locale);
  const seriesInfo = getSeriesInfo(post, locale);

  // Edit on GitHub link
  const githubRepo = config.themeConfig.socials?.github;
  const editFileName = isDirectoryPost(post.slug) ? `${post.slug}/index.mdx` : `${post.slug}.mdx`;
  const editUrl = githubRepo ? `${githubRepo}/edit/main/content/blog/${editFileName}` : null;

  // Series navigation
  const currentSeriesIndex = seriesInfo?.posts.findIndex((p) => p.slug === post.slug) ?? -1;
  const prevInSeries = seriesInfo && currentSeriesIndex > 0 ? seriesInfo.posts[currentSeriesIndex - 1] : null;
  const nextInSeries = seriesInfo && currentSeriesIndex < seriesInfo.posts.length - 1 ? seriesInfo.posts[currentSeriesIndex + 1] : null;

  const article = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16">
        {post.draft && isPreview && (
          <div className="mb-6 rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {locale === "ru" ? "Это черновик. Он виден только в режиме предпросмотра." : "This is a draft. It is only visible in preview mode."}
              {" "}
              <a href="/api/preview/exit" className="underline">
                {locale === "ru" ? "Выйти из превью" : "Exit preview"}
              </a>
            </p>
          </div>
        )}
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={post.date}>
                {format(new Date(post.date), "d MMMM yyyy", { locale: dateLocales[locale] ?? enUS })}
              </time>
              <span>&middot;</span>
              <span>{(post.readingTime.match(/\d+/) ?? ["1"])[0]} {readingTimeLabels[locale] ?? readingTimeLabels.en}</span>
            </div>
            <ShareButtons
              title={post.title}
              url={`${config.url}/blog/${post.slug}`}
            />
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {post.title}
          </h1>

          <p className="mt-3 text-lg text-muted-foreground">
            {post.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tags/${tag}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>

        </header>

        {seriesInfo && (
          <div className="mb-8 rounded-lg border border-border bg-accent/30 p-4">
            <p className="text-sm font-semibold text-foreground">
              {locale === "ru" ? "Серия" : "Series"}: {seriesInfo.name}
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {seriesInfo.posts.map((sp, i) => (
                <li key={sp.slug} className="flex items-center gap-2">
                  <span className="shrink-0 text-muted-foreground">{i + 1}.</span>
                  {sp.slug === post.slug ? (
                    <span className="font-medium text-foreground">{sp.title}</span>
                  ) : (
                    <Link
                      href={`/blog/${sp.slug}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {sp.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </div>

        {seriesInfo && (prevInSeries || nextInSeries) && (
          <div className="mt-10 border-t border-border pt-6 flex items-center justify-between gap-4">
            {prevInSeries ? (
              <Link
                href={`/blog/${prevInSeries.slug}`}
                className="flex flex-col text-sm hover:text-foreground transition-colors text-muted-foreground"
              >
                <span className="text-xs">{locale === "ru" ? "← Предыдущая" : "← Previous"}</span>
                <span className="font-medium">{prevInSeries.title}</span>
              </Link>
            ) : <div />}
            {nextInSeries ? (
              <Link
                href={`/blog/${nextInSeries.slug}`}
                className="flex flex-col items-end text-sm hover:text-foreground transition-colors text-muted-foreground"
              >
                <span className="text-xs">{locale === "ru" ? "Следующая →" : "Next →"}</span>
                <span className="font-medium">{nextInSeries.title}</span>
              </Link>
            ) : <div />}
          </div>
        )}

        {editUrl && (
          <div className="mt-10 border-t border-border pt-4">
            <Link
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ✏️ {locale === "ru" ? "Редактировать эту страницу на GitHub" : "Edit this page on GitHub"}
            </Link>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-10 border-t border-border pt-8">
            <h3 className="text-lg font-semibold mb-4">
              {locale === "ru" ? "Похожие статьи" : "Related posts"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
                >
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(rp.date), "d MMM yyyy", { locale: dateLocales[locale] ?? enUS })}
                  </p>
                  <h4 className="mt-1 font-medium leading-snug">{rp.title}</h4>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {rp.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <BlogComments slug={post.slug} locale={locale} />
      </article>
    </>
  );

  if (post.geoBlock) {
    return <GeoGuard geoBlock={post.geoBlock}>{article}</GeoGuard>;
  }

  return article;
}
