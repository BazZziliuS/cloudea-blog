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

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {sidebar.map((category) => {
          const formattedName =
            category.name.charAt(0).toUpperCase() +
            category.name.slice(1).replace(/-/g, " ");

          return (
            <div
              key={category.name}
              className="rounded-lg border border-border p-6"
            >
              <h2 className="text-xl font-semibold">
                {category.indexSlug ? (
                  <Link
                    href={`/docs/${category.indexSlug.join("/")}`}
                    className="hover:text-primary transition-colors"
                  >
                    {formattedName}
                  </Link>
                ) : (
                  formattedName
                )}
              </h2>
              <ul className="mt-4 space-y-2">
                {category.docs.map((doc) => (
                  <li key={doc.slug.join("/")}>
                    <Link
                      href={`/docs/${doc.slug.join("/")}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
