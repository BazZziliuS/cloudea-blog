import type { Metadata } from "next";
import Link from "next/link";
import { seo } from "@/lib/config";
import { getDocsIndex, getDocsSidebar } from "@/lib/content";
import { getDictionary, plural } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { compileMDX } from "@/lib/mdx";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";
import { humanizeSlug } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const docsIndex = getDocsIndex();
  const title = docsIndex?.title ?? getDictionary(await getLocale()).docs.title;
  const description = docsIndex?.description;
  return {
    ...seo({ title, description, path: "/docs" }),
    ...ogImageMetadata(title, description, ogImageUrl({ slug: "docs", type: "page" })),
  };
}

export default async function DocsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).docs;
  const docsIndex = getDocsIndex();

  // A root `content/docs/index.mdx` replaces the generated overview.
  if (docsIndex) {
    const content = await compileMDX(docsIndex.content);
    return (
      <div className="py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{docsIndex.title}</h1>
          {docsIndex.description && <p className="mt-2 text-lg text-muted-foreground">{docsIndex.description}</p>}
        </header>
        <div className="prose prose-neutral max-w-none dark:prose-invert">{content}</div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getDocsSidebar().map((category) => {
          const totalDocs =
            category.docs.length + category.subcategories.reduce((sum, sub) => sum + sub.docs.length, 0);

          return (
            <Link
              key={category.name}
              href={`/docs/${(category.indexSlug ?? [category.name]).join("/")}`}
              className="group rounded-lg border border-border p-5 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <h2 className="text-base font-semibold transition-colors group-hover:text-primary">
                {category.title ?? humanizeSlug(category.name)}
              </h2>
              <p className="text-xs text-muted-foreground">{plural(locale, totalDocs, t.docCount)}</p>
              {category.subcategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {category.subcategories.map((sub) => (
                    <span
                      key={sub.name}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
                      {sub.title ?? humanizeSlug(sub.name)}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
