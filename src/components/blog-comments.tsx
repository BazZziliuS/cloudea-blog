import { SupabaseComments } from "@/components/comments";
import { GiscusComments } from "@/components/giscus";
import { getConfig, isSupabaseAuthEnabled } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";

interface BlogCommentsProps {
  slug: string;
  locale: Locale;
  labels: Dictionary["comments"];
}

/** Render the comments widget for the configured provider. */
export function BlogComments({ slug, locale, labels }: BlogCommentsProps) {
  const { comments } = getConfig();

  if (comments.provider === "giscus" && comments.giscus?.repo) {
    return <GiscusComments config={comments.giscus} locale={locale} />;
  }

  if (isSupabaseAuthEnabled()) {
    return <SupabaseComments slug={slug} locale={locale} labels={labels} />;
  }

  return null;
}
