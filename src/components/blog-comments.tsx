"use client";

import { getConfig } from "@/lib/config";
import { GiscusComments } from "@/components/giscus";
import { SupabaseComments } from "@/components/comments";
import type { Locale } from "@/lib/i18n";

interface BlogCommentsProps {
  slug: string;
  locale: Locale;
}

export function BlogComments({ slug, locale }: BlogCommentsProps) {
  const config = getConfig();

  if (config.comments.provider === "giscus") {
    return <GiscusComments locale={locale} />;
  }

  if (config.comments.provider === "supabase") {
    return <SupabaseComments slug={slug} locale={locale} />;
  }

  return null;
}
