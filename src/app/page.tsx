import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Moon } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { BlogContent } from "@/components/blog-content";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { getConfig, seo, websiteJsonLd } from "@/lib/config";
import { getCustomPage, customPageExists } from "@/lib/content";
import { compileMDX } from "@/lib/mdx";

export async function generateMetadata() {
  const config = getConfig();
  const homepage = config.homepage ?? "landing";

  if (homepage === "blog") {
    const ogUrl = `${config.url}/api/og?type=page&slug=blog`;
    return {
      ...seo({
        title: config.title,
        description: config.seo.defaultDescription,
        path: "/",
      }),
      openGraph: {
        title: config.title,
        description: config.seo.defaultDescription,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
    };
  }

  return seo({
    title: config.title,
    description: config.seo.defaultDescription,
    path: "/",
  });
}

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const config = getConfig();
  const homepage = config.homepage ?? "landing";

  // Рендерим блог прямо на главной (как Docusaurus)
  if (homepage === "blog") {
    const locale = await getLocale();
    const dict = getDictionary(locale);
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

    return <BlogContent locale={locale} dict={dict} currentPage={currentPage} basePath="/" />;
  }

  // Redirect to docs
  if (homepage === "docs") redirect("/docs");

  // Custom page from content/pages/
  if (homepage !== "landing") {
    const slug = homepage.split("/");
    if (customPageExists(slug)) {
      const page = getCustomPage(slug);
      const content = await compileMDX(page.content);

      return (
        <article className="mx-auto max-w-3xl px-6 py-16">
          {page.title && (
            <header className="mb-10">
              <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
              {page.description && (
                <p className="mt-3 text-lg text-muted-foreground">{page.description}</p>
              )}
            </header>
          )}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {content}
          </div>
        </article>
      );
    }
  }

  // Default landing page
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.home;
  const jsonLd = websiteJsonLd();

  const features = [
    { icon: FileText, title: t.mdxTitle, description: t.mdxDesc },
    { icon: Moon, title: t.darkTitle, description: t.darkDesc },
    { icon: GitHubIcon, title: t.authTitle, description: t.authDesc },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/50 to-background" />

          <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Cloudea
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t.subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/blog">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  {t.readBlog}
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                  {t.documentation}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.features}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20 hover:bg-accent/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
