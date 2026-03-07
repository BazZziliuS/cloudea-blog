import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { BlogComments } from "@/components/blog-comments";
import { GeoGuard } from "@/components/geo-guard";
import { getLocale } from "@/lib/i18n-server";
import { seo, blogPostJsonLd, getConfig } from "@/lib/config";

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
    return {
      ...meta,
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

  let post;
  try {
    post = getPostBySlug(joined);
  } catch {
    notFound();
  }

  const content = await compileMDX(post.content, post.slug);
  const locale = await getLocale();
  const jsonLd = blogPostJsonLd(post);

  const article = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>
              {format(new Date(post.date), "d MMMM yyyy")}
            </time>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
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

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </div>

        <BlogComments slug={post.slug} locale={locale} />
      </article>
    </>
  );

  if (post.geoBlock) {
    return <GeoGuard geoBlock={post.geoBlock}>{article}</GeoGuard>;
  }

  return article;
}
