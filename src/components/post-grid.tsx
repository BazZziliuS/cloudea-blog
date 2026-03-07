"use client";

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
}

export function PostGrid({ posts }: PostGridProps) {
  const hasGeoBlocked = posts.some((p) => p.geoBlock);
  const { country, loaded } = useUserCountry();

  // If no posts have geo_block, skip country detection entirely
  const resolvedCountry = hasGeoBlocked ? (loaded ? country : null) : null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          slug={post.slug}
          title={post.title}
          description={post.description}
          date={post.date}
          readingTime={post.readingTime}
          tags={post.tags}
          geoBlock={post.geoBlock}
          userCountry={resolvedCountry}
        />
      ))}
    </div>
  );
}
