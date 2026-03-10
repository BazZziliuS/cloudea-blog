import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/content";
import { PostGrid } from "@/components/post-grid";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo } from "@/lib/config";

export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag: tag.name }));
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return seo({
    title: `#${decoded}`,
    description: `Posts tagged "${decoded}"`,
    path: `/blog/tags/${tag}`,
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.blog;

  if (posts.length === 0) {
    notFound();
  }

  const countLabel =
    posts.length === 1
      ? t.post
      : posts.length < 5
        ? t.posts2_4
        : t.posts5;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <Link
          href="/blog/tags"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; {t.backToTags}
        </Link>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">#{decoded}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {posts.length} {countLabel}
        </p>
      </div>

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
    </div>
  );
}
