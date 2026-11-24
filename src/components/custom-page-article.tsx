import type { CustomPage } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";

/** Render a page from `content/pages`. */
export async function CustomPageArticle({ page }: { page: CustomPage }) {
  const content = await compileMDX(page.content);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {page.title && (
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
          {page.description && <p className="mt-3 text-lg text-muted-foreground">{page.description}</p>}
        </header>
      )}
      <div className="prose prose-neutral max-w-none dark:prose-invert">{content}</div>
    </article>
  );
}
