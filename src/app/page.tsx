import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Moon } from "lucide-react";
import { BlogContent } from "@/components/blog-content";
import { CustomPageArticle } from "@/components/custom-page-article";
import { GitHubIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { getConfig, seo, websiteJsonLd } from "@/lib/config";
import { customPageExists, getCustomPage } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";
import { parsePageParam } from "@/lib/utils";

interface HomePageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

function getHomepageMode() {
  return getConfig().homepage ?? "landing";
}

export function generateMetadata(): Metadata {
  const config = getConfig();
  const meta = seo({ path: "/" });

  if (getHomepageMode() === "blog") {
    const { openGraph, twitter } = ogImageMetadata(
      config.title,
      config.seo.defaultDescription,
      ogImageUrl({ slug: "blog", type: "page" }),
    );
    return { ...meta, openGraph: { ...meta.openGraph, ...openGraph }, twitter: { ...meta.twitter, ...twitter } };
  }

  return meta;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const homepage = getHomepageMode();

  if (homepage === "docs") redirect("/docs");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  if (homepage === "blog") {
    const { page } = await searchParams;
    return <BlogContent locale={locale} dict={dict} currentPage={parsePageParam(page)} basePath="/" />;
  }

  if (homepage !== "landing") {
    const slug = homepage.split("/");
    if (customPageExists(slug)) return <CustomPageArticle page={getCustomPage(slug)} />;
  }

  return <Landing t={dict.home} />;
}

function Landing({ t }: { t: ReturnType<typeof getDictionary>["home"] }) {
  const features = [
    { icon: FileText, title: t.mdxTitle, description: t.mdxDesc },
    { icon: Moon, title: t.darkTitle, description: t.darkDesc },
    { icon: GitHubIcon, title: t.authTitle, description: t.authDesc },
  ];

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <div className="flex flex-col">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/50 to-background" />

          <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {getConfig().themeConfig.navbar.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">{t.subtitle}</p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/blog">{t.readBlog}</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/docs">{t.documentation}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t.features}</h2>
            <p className="mt-4 text-muted-foreground">{t.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20 hover:bg-accent/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
