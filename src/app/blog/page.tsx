import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlogContent } from "@/components/blog-content";
import { getConfig, seo } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";
import { parsePageParam } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = getDictionary(await getLocale());
  return {
    ...seo({ title: blog.title, description: blog.subtitle, path: "/blog" }),
    ...ogImageMetadata(blog.title, blog.subtitle, ogImageUrl({ slug: "blog", type: "page" })),
  };
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = parsePageParam((await searchParams).page);

  // The blog is already rendered on the homepage — avoid duplicate content.
  if (getConfig().homepage === "blog") {
    redirect(currentPage > 1 ? `/?page=${currentPage}` : "/");
  }

  const locale = await getLocale();
  return <BlogContent locale={locale} dict={getDictionary(locale)} currentPage={currentPage} basePath="/blog" />;
}
