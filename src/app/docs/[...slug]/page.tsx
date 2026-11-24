import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { TableOfContents } from "@/components/toc";
import { docJsonLd, getEditUrl, seo } from "@/lib/config";
import { getAllDocs, getDocBySlug, type Doc } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { getDictionary, interpolate } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { compileMDX } from "@/lib/mdx";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";
import { humanizeSlug } from "@/lib/utils";

export const revalidate = 3600;

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

function findDoc(slug: string[]): Doc | null {
  try {
    return getDocBySlug(slug);
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const doc = findDoc((await params).slug);
  if (!doc) return seo({ title: "Doc Not Found", noIndex: true });

  const slug = doc.slug.join("/");
  return {
    ...seo({ title: doc.title, description: doc.description, path: `/docs/${slug}` }),
    ...ogImageMetadata(doc.title, doc.description, ogImageUrl({ slug, type: "doc" })),
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = findDoc(slug);
  if (!doc) notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const content = await compileMDX(doc.content, { slug: slug.join("/"), contentType: "docs", title: doc.title });
  const editUrl = getEditUrl(doc.sourcePath);

  // Link intermediate breadcrumb segments only when a page exists for them.
  const existingDocs = new Set(getAllDocs().map((d) => d.slug.join("/")));
  const breadcrumbs = [
    { label: dict.blog.docs, href: "/docs" },
    ...slug.slice(0, -1).map((segment, index) => {
      const path = slug.slice(0, index + 1).join("/");
      return { label: humanizeSlug(segment), href: existingDocs.has(path) ? `/docs/${path}` : undefined };
    }),
    { label: doc.title },
  ];

  return (
    <>
      <JsonLd data={docJsonLd(doc)} />
      <div className="flex gap-10">
        <div className="min-w-0 flex-1 py-10">
          <Breadcrumbs items={breadcrumbs} />

          <header className="mb-8 mt-4">
            <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
            {doc.description && <p className="mt-2 text-lg text-muted-foreground">{doc.description}</p>}
          </header>

          <div className="xl:hidden">
            <TableOfContents label={dict.blog.toc} labels={dict.common} variant="collapsible" />
          </div>

          <div className="prose prose-neutral max-w-none dark:prose-invert">{content}</div>

          <AdSlot placement="doc-bottom" />

          <div className="mt-10 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
            <time dateTime={doc.lastModified}>
              {interpolate(dict.docs.updated, { date: formatDate(doc.lastModified, locale) })}
            </time>
            {editUrl && (
              <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {dict.docs.editOnGithub}
              </a>
            )}
          </div>
        </div>

        <div className="hidden w-56 shrink-0 py-10 xl:block">
          <TableOfContents label={dict.blog.onThisPage} labels={dict.common} />
        </div>
      </div>
    </>
  );
}
