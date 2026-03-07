import { notFound } from "next/navigation";
import { getAllDocs, getDocBySlug } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";
import { TableOfContents } from "@/components/toc";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo, docJsonLd } from "@/lib/config";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex gap-10">
        <div className="min-w-0 flex-1 py-10">
          <header className="mb-8">
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
        </div>

        <div className="hidden xl:block w-56 shrink-0 py-10">
          <TableOfContents label={dict.blog.onThisPage} />
        </div>
      </div>
    </>
  );
}
