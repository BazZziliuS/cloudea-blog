import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/post-grid";
import { seo } from "@/lib/config";
import { getAllTags, getPostsByTag } from "@/lib/content";
import { getDictionary, interpolate, plural } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { toPostCardData } from "@/lib/post-format";

export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

function decodeTag(tag: string): string {
  try {
    return decodeURIComponent(tag);
  } catch {
    return tag;
  }
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.name }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeTag((await params).tag);
  const { blog } = getDictionary(await getLocale());
  return seo({
    title: `#${tag}`,
    description: interpolate(blog.taggedWith, { tag }),
    path: `/blog/tags/${encodeURIComponent(tag)}`,
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeTag((await params).tag);
  const locale = await getLocale();
  const posts = getPostsByTag(tag, locale);
  if (posts.length === 0) notFound();

  const dict = getDictionary(locale);
  const t = dict.blog;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <Link href="/blog/tags" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          &larr; {t.backToTags}
        </Link>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">#{tag}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{plural(locale, posts.length, t.postCount)}</p>
      </div>

      <PostGrid
        posts={posts.map((post) => toPostCardData(post, locale))}
        labels={{ showMore: t.showMore, shownOf: t.shownOf, unavailableShort: dict.geo.unavailableShort }}
      />
    </div>
  );
}
