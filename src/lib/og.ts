import { absoluteUrl } from "@/lib/config";

export type OgImageType = "blog" | "doc" | "page" | "project";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** URL of the dynamic Open Graph image for a piece of content (see /api/og). */
export function ogImageUrl({ slug, type = "blog" }: { slug: string; type?: OgImageType }): string {
  const params = new URLSearchParams({ slug });
  if (type !== "blog") params.set("type", type);
  return absoluteUrl(`/api/og?${params}`);
}

/** Open Graph + Twitter image metadata for a page. */
export function ogImageMetadata(title: string, description: string | undefined, url: string) {
  return {
    openGraph: { title, description, images: [{ url, ...OG_IMAGE_SIZE }] },
    twitter: { card: "summary_large_image" as const, title, description, images: [url] },
  };
}
