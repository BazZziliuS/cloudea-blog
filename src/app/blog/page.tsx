import { BlogContent } from "@/components/blog-content";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo, getConfig } from "@/lib/config";

export const revalidate = 3600;

export async function generateMetadata() {
  const config = getConfig();
  const ogUrl = `${config.url}/api/og?type=page&slug=blog`;
  return {
    ...seo({
      title: "Blog",
      description: "Articles, tutorials, and announcements",
      path: "/blog",
    }),
    openGraph: {
      title: "Blog",
      description: "Articles, tutorials, and announcements",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [ogUrl],
    },
  };
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  return <BlogContent locale={locale} dict={dict} currentPage={currentPage} basePath="/blog" />;
}
