import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { GeoBlock } from "@/lib/content";

/** Pre-formatted, serializable post data for listing cards. */
export interface PostCardData {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  readingLabel: string;
  tags: string[];
  geoBlock?: GeoBlock;
}

interface PostCardProps {
  post: PostCardData;
  /** When set, the card is blurred, unclickable and shows this message. */
  blockedMessage?: string;
}

export function PostCard({ post, blockedMessage }: PostCardProps) {
  const isBlocked = Boolean(blockedMessage);

  const card = (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/50">
      {isBlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">⛔ {blockedMessage}</p>
        </div>
      )}
      <article className={`flex flex-1 flex-col ${isBlocked ? "select-none blur-sm" : ""}`} aria-hidden={isBlocked}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={post.date}>{post.dateLabel}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingLabel}</span>
        </div>
        <h2 className="mt-3 text-xl font-semibold transition-colors group-hover:text-primary">{post.title}</h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>
      </article>
    </div>
  );

  if (isBlocked) return card;

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      {card}
    </Link>
  );
}
