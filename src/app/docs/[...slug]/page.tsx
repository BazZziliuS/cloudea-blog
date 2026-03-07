import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDocs, getDocBySlug } from "@/lib/content";
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
  try {
    const doc = getDocBySlug(slug);
    return seo({
      title: doc.title,
      description: doc.description,
      path: `/docs/${doc.slug.join("/")}`,
    });
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

  const breadcrumbItems = [
    { label: dict.blog.docs ?? "Docs", href: "/docs" },
    ...slug.slice(0, -1).map((segment, i) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: `/docs/${slug.slice(0, i + 1).join("/")}`,
    })),
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

          {editUrl && (
            <div className="mt-10 border-t border-border pt-4">
              <Link
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ✏️ Редактировать эту страницу на GitHub
              </Link>
            </div>
          )}
        </div>

        <div className="hidden xl:block w-56 shrink-0 py-10">
          <TableOfContents label={dict.blog.onThisPage} />
        </div>
      </div>
    </>
  );
}
