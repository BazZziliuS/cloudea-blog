import { notFound } from "next/navigation";
import { getAllCustomPages, getCustomPage, customPageExists } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";
import { seo, getConfig } from "@/lib/config";

interface CustomPageProps {
  params: Promise<{ page: string[] }>;
}

export async function generateStaticParams() {
  const pages = getAllCustomPages();
  return pages.map((p) => ({ page: p.slug }));
}

export async function generateMetadata({ params }: CustomPageProps) {
  const { page } = await params;
  if (!customPageExists(page)) return seo({ title: "Not Found", noIndex: true });

  const config = getConfig();
  const data = getCustomPage(page);
  const ogUrl = `${config.url}/api/og?type=page&slug=${encodeURIComponent(page.join("/"))}`;
  return {
    ...seo({
      title: data.title,
      description: data.description,
      path: `/${page.join("/")}`,
    }),
    openGraph: {
      title: data.title,
      description: data.description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: data.title,
      description: data.description,
      images: [ogUrl],
    },
  };
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { page } = await params;

  if (!customPageExists(page)) {
    notFound();
  }

  const data = getCustomPage(page);
  const content = await compileMDX(data.content);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {data.title && (
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">{data.title}</h1>
          {data.description && (
            <p className="mt-3 text-lg text-muted-foreground">{data.description}</p>
          )}
        </header>
      )}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {content}
      </div>
    </article>
  );
}
