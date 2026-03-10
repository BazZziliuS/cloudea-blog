import Link from "next/link";
import { getDocsSidebar, getDocsIndex } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { seo, getConfig } from "@/lib/config";

export const revalidate = 3600;

export async function generateMetadata() {
  const docsIndex = getDocsIndex();
  const config = getConfig();
  const title = docsIndex?.title ?? "Documentation";
  const description = docsIndex?.description;
  const ogUrl = `${config.url}/api/og?type=page&slug=docs`;
  return {
    ...seo({
      title,
      description,
      path: "/docs",
    }),
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [ogUrl],
    },
  };
}

export default async function DocsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const docsIndex = getDocsIndex();

  // If there's a root index.mdx, render it
  if (docsIndex) {
    const content = await compileMDX(docsIndex.content);

    return (
      <div className="py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{docsIndex.title}</h1>
          {docsIndex.description && (
            <p className="mt-2 text-lg text-muted-foreground">
              {docsIndex.description}
            </p>
          )}
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </div>
      </div>
    );
  }

  // Fallback: show category overview
  const sidebar = getDocsSidebar();

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold tracking-tight">
        {dict.blog.docs ?? "Documentation"}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {locale === "ru"
          ? "Документация, вики и заметки."
          : "Guides, wiki and notes."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sidebar.map((category) => {
          const displayName = category.title ?? category.name.charAt(0).toUpperCase() + category.name.slice(1).replace(/-/g, " ");
          const totalDocs = category.docs.length +
            category.subcategories.reduce((sum, sub) => sum + sub.docs.length, 0);

          return (
            <Link
              key={category.name}
              href={category.indexSlug ? `/docs/${category.indexSlug.join("/")}` : `/docs/${category.name}`}
              className="group rounded-lg border border-border p-5 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <div>
                <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                  {displayName}
                </h2>
                  <p className="text-xs text-muted-foreground">
                    {totalDocs} {locale === "ru"
                      ? (totalDocs === 1 ? "документ" : totalDocs < 5 ? "документа" : "документов")
                      : (totalDocs === 1 ? "doc" : "docs")}
                  </p>
              </div>
              {category.subcategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {category.subcategories.map((sub) => (
                    <span
                      key={sub.name}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
                      {sub.title ?? sub.name}
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
