import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getDocBySlug, getAllDocs } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";
import { TableOfContents } from "@/components/toc";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo, docJsonLd, getConfig } from "@/lib/config";

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const config = getConfig();
  try {
    const doc = getDocBySlug(slug);
    const ogUrl = `${config.url}/api/og?type=doc&slug=${encodeURIComponent(doc.slug.join("/"))}`;
    return {
      ...seo({
        title: doc.title,
        description: doc.description,
        path: `/docs/${doc.slug.join("/")}`,
      }),
      openGraph: {
        title: doc.title,
        description: doc.description,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image" as const,
        title: doc.title,
        description: doc.description,
        images: [ogUrl],
      },
    };
  } catch {
    return seo({ title: "Doc Not Found", noIndex: true });
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;

  let doc;
  try {
    doc = getDocBySlug(slug);
  } catch {
    notFound();
  }

  const content = await compileMDX(doc.content);
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const jsonLd = docJsonLd(doc);
  const config = getConfig();

  const githubRepo = config.themeConfig.socials?.github;
  const editUrl = githubRepo
    ? `${githubRepo}/edit/main/content/docs/${slug.join("/")}.mdx`
    : null;

  const allDocs = getAllDocs();
  const docSlugsSet = new Set(allDocs.map((d) => d.slug.join("/")));

  const breadcrumbItems = [
    { label: dict.blog.docs ?? "Docs", href: "/docs" },
    ...slug.slice(0, -1).map((segment, i) => {
      const path = slug.slice(0, i + 1).join("/");
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: docSlugsSet.has(path) ? `/docs/${path}` : undefined,
      };
    }),
    { label: doc.title },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex gap-10">
        <div className="min-w-0 flex-1 py-10">
          <Breadcrumbs items={breadcrumbItems} />

          <header className="mt-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
            {doc.description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {doc.description}
              </p>
            )}
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {content}
          </div>

          <div className="mt-10 border-t border-border pt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {locale === "ru" ? "Обновлено" : "Updated"}{" "}
              {format(new Date(doc.lastModified), "d MMM yyyy")}
            </span>
            {editUrl && (
              <Link
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                ✏️ {locale === "ru" ? "Редактировать на GitHub" : "Edit on GitHub"}
              </Link>
            )}
          </div>
        </div>

        <div className="hidden xl:block w-56 shrink-0 py-10">
          <TableOfContents label={dict.blog.onThisPage} />
        </div>
      </div>
    </>
  );
}
