import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomPageArticle } from "@/components/custom-page-article";
import { seo } from "@/lib/config";
import { customPageExists, getAllCustomPages, getCustomPage } from "@/lib/content";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";

interface CustomPageProps {
  params: Promise<{ page: string[] }>;
}

export function generateStaticParams() {
  return getAllCustomPages().map((page) => ({ page: page.slug }));
}

export async function generateMetadata({ params }: CustomPageProps): Promise<Metadata> {
  const { page } = await params;
  if (!customPageExists(page)) return seo({ title: "Not Found", noIndex: true });

  const data = getCustomPage(page);
  const slug = page.join("/");
  return {
    ...seo({ title: data.title, description: data.description, path: `/${slug}` }),
    ...ogImageMetadata(data.title, data.description, ogImageUrl({ slug, type: "page" })),
  };
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { page } = await params;
  if (!customPageExists(page)) notFound();

  return <CustomPageArticle page={getCustomPage(page)} />;
}
