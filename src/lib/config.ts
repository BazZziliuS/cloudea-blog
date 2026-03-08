import type { Metadata } from "next";

export interface LocalizedString {
  ru: string;
  en: string;
  [key: string]: string;
}

export interface NavLink {
  href: string;
  label: string | LocalizedString;
  external?: boolean;
}

export interface NavDropdown {
  label: string | LocalizedString;
  items: NavLink[];
}

export type NavItem = NavLink | NavDropdown;

export function isNavDropdown(item: NavItem): item is NavDropdown {
  return "items" in item;
}

export interface FooterLinkGroup {
  title: string | LocalizedString;
  items: Array<{
    label: string | LocalizedString;
    href: string;
    external?: boolean;
  }>;
}

export interface SeoConfig {
  titleTemplate: string;
  defaultDescription: string;
  keywords?: string[];

  openGraph?: {
    type?: string;
    siteName?: string;
    locale?: string;
  };

  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player";
    site?: string;
    creator?: string;
  };

  verification?: {
    google?: string;
    yandex?: string;
  };

  structuredData?: {
    organization?: {
      name: string;
      url: string;
      logo?: string;
    };
  };

  robots?: {
    index: boolean;
    follow: boolean;
  };
}

export interface CloudeaConfig {
  title: string;
  tagline: string;
  url: string;
  favicon: string;

  /** Homepage mode:
   * - "landing" — default hero landing page
   * - "blog"    — show blog listing as homepage
   * - "docs"    — show docs listing as homepage
   * - any string — custom page slug from content/pages/ (e.g. "about")
   */
  homepage?: "landing" | "blog" | "docs" | string;

  /** Custom CSS files to load (relative to project root).
   * Example: ["styles/custom.css", "styles/overrides.css"]
   */
  customCss?: string[];

  /** Custom scripts to inject into the page.
   * Each script can be:
   * - a file path (relative to project root): { src: "scripts/geo-block.js" }
   * - inline code: { code: "console.log('hello')" }
   * - external URL: { src: "https://example.com/analytics.js", external: true }
   *
   * Options:
   * - strategy: "beforeInteractive" | "afterInteractive" | "lazyOnload" (default: "afterInteractive")
   * - position: "head" | "body" (default: "body")
   */
  customScripts?: Array<{
    src?: string;
    code?: string;
    external?: boolean;
    strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
    position?: "head" | "body";
  }>;

  /** Analytics integrations */
  analytics?: {
    /** Google Analytics / gtag measurement ID (e.g. "G-XXXXXXXXXX") */
    gtag?: string;
    /** Yandex.Metrika counter ID (e.g. "12345678") */
    yandexMetrika?: string;
  };

  i18n: {
    defaultLocale: string;
    locales: string[];
  };

  seo: SeoConfig;

  themeConfig: {
    colorMode: {
      defaultMode: "light" | "dark" | "system";
      respectPrefersColorScheme: boolean;
    };

    navbar: {
      title: string;
      logo?: string;
      links: NavItem[];
    };

    /** Donate / support button in navbar */
    donateLink?: {
      href: string;
      label?: string | LocalizedString;
    };

    footer: {
      copyright: string;
      links: FooterLinkGroup[];
    };

    socials?: {
      github?: string;
      twitter?: string;
      discord?: string;
    };
  };

  supabase?: {
    url: string;
    anonKey: string;
  };

  comments: {
    provider: "giscus" | "supabase" | "none";

    giscus?: {
      repo: string;
      repoId: string;
      category: string;
      categoryId: string;
      mapping: string;
    };
  };
}

function resolveLocalizedString(
  value: string | LocalizedString,
  locale: string
): string {
  if (typeof value === "string") return value;
  return value[locale] ?? value["en"] ?? Object.values(value)[0] ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const userConfig: CloudeaConfig = require("../../cloudea.config").default;

export function getConfig(): CloudeaConfig {
  return userConfig;
}

export function getNavLinks(locale: string) {
  return userConfig.themeConfig.navbar.links.map((item) => {
    if (isNavDropdown(item)) {
      return {
        type: "dropdown" as const,
        label: resolveLocalizedString(item.label, locale),
        items: item.items.map((link) => ({
          href: link.href,
          label: resolveLocalizedString(link.label, locale),
          external: link.external,
        })),
      };
    }
    return {
      type: "link" as const,
      href: item.href,
      label: resolveLocalizedString(item.label, locale),
      external: item.external,
    };
  });
}

export function getDonateLink(locale: string) {
  const donate = userConfig.themeConfig.donateLink;
  if (!donate) return null;
  return {
    href: donate.href,
    label: donate.label
      ? resolveLocalizedString(donate.label, locale)
      : locale === "ru" ? "Поддержать" : "Donate",
  };
}

export function getFooterLinks(locale: string) {
  return userConfig.themeConfig.footer.links.map((group) => ({
    title: resolveLocalizedString(group.title, locale),
    items: group.items.map((item) => ({
      label: resolveLocalizedString(item.label, locale),
      href: item.href,
      external: item.external,
    })),
  }));
}

// ---- SEO Utilities ----

interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
  noIndex?: boolean;
}

/**
 * Генерирует Metadata для любой страницы на основе конфига и переданных параметров.
 *
 * Использование:
 *   export const metadata = seo({ title: "Блог", path: "/blog" });
 *   export async function generateMetadata() { return seo({ title: post.title, ... }); }
 */
export function seo(options: SeoOptions = {}): Metadata {
  const config = getConfig();
  const {
    title,
    description = config.seo.defaultDescription,
    path = "",
    type = "website",
    article,
    noIndex = false,
  } = options;

  const url = `${config.url}${path}`;
  const seoConfig = config.seo;

  const metadata: Metadata = {
    title: title ?? config.title,
    description,
    keywords: seoConfig.keywords,
    metadataBase: new URL(config.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title ?? config.title,
      description,
      url,
      siteName: seoConfig.openGraph?.siteName ?? config.title,
      locale: seoConfig.openGraph?.locale ?? config.i18n.defaultLocale,
      type: type === "article" ? "article" : "website",
      ...(article && type === "article"
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: seoConfig.twitter?.card ?? "summary_large_image",
      title: title ?? config.title,
      description,
      ...(seoConfig.twitter?.site ? { site: seoConfig.twitter.site } : {}),
      ...(seoConfig.twitter?.creator
        ? { creator: seoConfig.twitter.creator }
        : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: seoConfig.robots?.index ?? true,
          follow: seoConfig.robots?.follow ?? true,
        },
    ...(seoConfig.verification
      ? {
          verification: {
            ...(seoConfig.verification.google
              ? { google: seoConfig.verification.google }
              : {}),
            ...(seoConfig.verification.yandex
              ? { yandex: seoConfig.verification.yandex }
              : {}),
          },
        }
      : {}),
  };

  return metadata;
}

/**
 * JSON-LD для WebSite (главная)
 */
export function websiteJsonLd(): Record<string, unknown> {
  const config = getConfig();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.title,
    description: config.seo.defaultDescription,
    url: config.url,
    ...(config.seo.structuredData?.organization
      ? {
          publisher: {
            "@type": "Organization",
            name: config.seo.structuredData.organization.name,
            url: config.seo.structuredData.organization.url,
            ...(config.seo.structuredData.organization.logo
              ? {
                  logo: {
                    "@type": "ImageObject",
                    url: config.seo.structuredData.organization.logo,
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}

/**
 * JSON-LD для BlogPosting
 */
export function blogPostJsonLd(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags?: string[];
}): Record<string, unknown> {
  const config = getConfig();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${config.url}/blog/${post.slug}`,
    keywords: post.tags?.join(", "),
    ...(config.seo.structuredData?.organization
      ? {
          author: {
            "@type": "Organization",
            name: config.seo.structuredData.organization.name,
            url: config.seo.structuredData.organization.url,
          },
        }
      : {}),
  };
}

/**
 * JSON-LD для TechArticle (документация)
 */
export function docJsonLd(doc: {
  title: string;
  description: string;
  slug: string[];
}): Record<string, unknown> {
  const config = getConfig();
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    description: doc.description,
    url: `${config.url}/docs/${doc.slug.join("/")}`,
    ...(config.seo.structuredData?.organization
      ? {
          author: {
            "@type": "Organization",
            name: config.seo.structuredData.organization.name,
          },
        }
      : {}),
  };
}

export { resolveLocalizedString };
