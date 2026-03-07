"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { GeoBlock } from "@/lib/content";

interface PostCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  geoBlock?: GeoBlock;
  userCountry: string | null;
}

export function PostCard({
  slug,
  title,
  description,
  date,
  readingTime,
  tags,
  geoBlock,
  userCountry,
}: PostCardProps) {
  const isBlocked = geoBlock && userCountry !== null && geoBlock.countries.includes(userCountry);

  const card = (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/50">
      {isBlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">⛔ {geoBlock.message ?? "Недоступно в вашем регионе"}</p>
        </div>
      )}
      <article className={isBlocked ? "blur-sm select-none" : ""}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={date}>
            {format(new Date(date), "d MMM yyyy")}
          </time>
          <span>&middot;</span>
          <span>{readingTime}</span>
        </div>
        <h2 className="mt-3 text-xl font-semibold group-hover:text-primary transition-colors">
          {title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </article>
    </div>
  );

  if (isBlocked) return card;

  return (
    <Link href={`/blog/${slug}`} className="group">
      {card}
    </Link>
  );
}

/** Hook to detect user country once, shared across cards */
export function useUserCountry() {
  const [country, setCountry] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setCountry(data.country_code ?? null);
        setLoaded(true);
      })
      .catch(() => {
        setCountry("UNKNOWN");
        setLoaded(true);
      });
  }, []);

  return { country, loaded };
}
