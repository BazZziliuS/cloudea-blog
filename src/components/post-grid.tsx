"use client";

import { useState } from "react";
import { PostCard, type PostCardData } from "@/components/post-card";
import { isGeoBlocked, useGeoCountry } from "@/hooks/use-geo-country";
import { interpolate, type Dictionary } from "@/lib/i18n";

interface PostGridProps {
  posts: PostCardData[];
  labels: Pick<Dictionary["blog"], "showMore" | "shownOf"> & Pick<Dictionary["geo"], "unavailableShort">;
  perPage?: number;
}

export function PostGrid({ posts, labels, perPage = 12 }: PostGridProps) {
  const [visibleCount, setVisibleCount] = useState(perPage);
  // Only ask for the visitor's country when something on the page is geo-restricted.
  const geo = useGeoCountry(posts.some((post) => post.geoBlock));

  const visible = posts.slice(0, visibleCount);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        {visible.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            blockedMessage={
              post.geoBlock && isGeoBlocked(geo, post.geoBlock.countries)
                ? (post.geoBlock.message ?? labels.unavailableShort)
                : undefined
            }
          />
        ))}
      </div>

      {visibleCount < posts.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + perPage)}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent"
          >
            {labels.showMore}
          </button>
        </div>
      )}

      {posts.length > perPage && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {interpolate(labels.shownOf, { shown: visible.length, total: posts.length })}
        </p>
      )}
    </div>
  );
}
