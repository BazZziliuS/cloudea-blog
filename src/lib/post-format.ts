import type { PostCardData } from "@/components/post-card";
import type { Post } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { getDictionary, interpolate, type Locale } from "@/lib/i18n";

export function readingTimeLabel(minutes: number, locale: Locale): string {
  return interpolate(getDictionary(locale).blog.minRead, { count: minutes });
}

/** Prepare a post for client-side listing components. */
export function toPostCardData(post: Post, locale: Locale): PostCardData {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    dateLabel: formatDate(post.date, locale, "medium"),
    readingLabel: readingTimeLabel(post.readingMinutes, locale),
    tags: post.tags,
    geoBlock: post.geoBlock,
  };
}
