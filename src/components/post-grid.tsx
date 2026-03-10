"use client";

import { useState } from "react";
import { PostCard, useUserCountry } from "@/components/post-card";
import type { GeoBlock } from "@/lib/content";

interface PostData {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  geoBlock?: GeoBlock;
}

interface PostGridProps {
  posts: PostData[];
  locale?: string;
  perPage?: number;
}

export function PostGrid({ posts, locale = "en", perPage = 12 }: PostGridProps) {
  const hasGeoBlocked = posts.some((p) => p.geoBlock);
  const { country, loaded } = useUserCountry();
  const [page, setPage] = useState(1);

  const resolvedCountry = hasGeoBlocked ? (loaded ? country : null) : null;

  const totalPages = Math.ceil(posts.length / perPage);
  const paginated = posts.slice(0, page * perPage);
  const hasMore = page < totalPages;

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        {paginated.map((post) => (
          <PostCard
            key={post.slug}
            slug={post.slug}
            title={post.title}
            description={post.description}
            date={post.date}
            readingTime={post.readingTime}
            tags={post.tags}
            locale={locale}
            geoBlock={post.geoBlock}
            userCountry={resolvedCountry}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:border-primary/50"
          >
            {locale === "ru" ? "Показать ещё" : locale === "zh" ? "显示更多" : "Show more"}
          </button>
        </div>
      )}

      {posts.length > perPage && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {paginated.length} из {posts.length}
        </p>
      )}
    </div>
  );
}
