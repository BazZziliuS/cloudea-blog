import type { Metadata } from "next";
import userConfig from "../../cloudea.config";

export interface LocalizedString {
  ru: string;
  en: string;
  [key: string]: string;
}

export interface NavLink {
  href: string;
  label: string | LocalizedString;
  icon?: string;
  external?: boolean;
}

export interface NavDropdown {
  label: string | LocalizedString;
  href?: string;
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
    icon?: string;
    external?: boolean;
  }>;
}

/** Where an ad block can appear. `inline` is used from MDX via `<Ad />`. */
export type AdPlacement = "post-bottom" | "doc-bottom" | "blog-list" | "inline";

export interface AdSlotConfig {
  /** Widget script URL. */
  src: string;
  /** Locales the widget supports: its `locale=` parameter follows the page locale when listed. */
  locales?: string[];
  /** Reserved height in px to avoid layout shift while the widget loads. */
  minHeight?: number;
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

  /** Portfolio and products section (content/projects). */
  projects?: {
    /** Where to order a similar project or ask about one, e.g. a Telegram or Discord profile. */
    contact?: { href: string; label?: string | LocalizedString };
  };

  /** Ad blocks rendered inside the page layout.
   *
   * Each placement takes a widget script URL (e.g. a Travelpayouts widget from
   * "Tools → Widgets"). Widgets that render where their `<script>` tag is placed
   * are mounted into a labelled container, lazily when scrolled into view.
   */
  ads?: {
    /** Label shown above every block. Russian law requires ads to be marked. */
    label?: string | LocalizedString;
    slots: Partial<Record<AdPlacement, AdSlotConfig>>;
  };

  /** Monetag ad network integration.
   * When set, injects the Monetag tag script into <head> and exposes
   * a Monetag service worker at /sw.js built from the provided values.
   * Leave undefined to disable. All fields come from your Monetag dashboard.
   */
  monetag?: {
    /** Tag script zone (data-zone attribute on the injected <script>) */
    tagZoneId: string;
    /** Tag script source URL (e.g. "https://quge5.com/88/tag.min.js") */
    tagSrc: string;
    /** Service worker: zone id for push subscriptions */
    swZoneId?: number;
    /** Service worker: Monetag push domain (e.g. "3nbf4.com") */
    swDomain?: string;
  };

  /** Extra Content-Security-Policy sources, merged with the ones derived from this config
   * (analytics, external custom scripts, Supabase, giscus).
   * Use it for third-party scripts that load further resources from other hosts.
   */
  csp?: {
    scriptSrc?: string[];
    connectSrc?: string[];
    frameSrc?: string[];
    imgSrc?: string[];
    styleSrc?: string[];
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

export function resolveLocalizedString(
  value: string | LocalizedString,
  locale: string
): string {
  if (typeof value === "string") return value;
  return value[locale] ?? value["en"] ?? Object.values(value)[0] ?? "";
}

export function getConfig(): CloudeaConfig {
  return userConfig;
}

/** Site URL without a trailing slash. */
export function getBaseUrl(): string {
  return userConfig.url.replace(/\/+$/, "");
}

/** Absolute URL for a site path. */
export function absoluteUrl(path = ""): string {
  return `${getBaseUrl()}${path}`;
}

/** "Edit on GitHub" link for a repository-relative source file, or null when no repo is configured. */
export function getEditUrl(sourcePath: string): string | null {
  const repo = userConfig.themeConfig.socials?.github?.replace(/\/+$/, "");
  return repo ? `${repo}/edit/main/${sourcePath}` : null;
}

/** Supabase credentials. Throws when Supabase features are used without configuration. */
export function getSupabaseConfig(): { url: string; anonKey: string } {
  if (!userConfig.supabase) {
    throw new Error("Supabase is not configured. Add a `supabase` section to cloudea.config.ts.");
  }
  return userConfig.supabase;
}

/** Contact link for project orders, or null when not configured. */
export function getProjectContact(locale: string, defaultLabel: string): { href: string; label: string } | null {
  const contact = userConfig.projects?.contact;
  if (!contact) return null;
  return { href: contact.href, label: contact.label ? resolveLocalizedString(contact.label, locale) : defaultLabel };
}

export interface ResolvedAdSlot {
  src: string;
  label: string;
  minHeight: number;
}

/** Ad slot for a placement with locale applied, or null when the placement is not configured. */
export function getAdSlot(placement: AdPlacement, locale: string, defaultLabel: string): ResolvedAdSlot | null {
  const ads = userConfig.ads;
  const slot = ads?.slots[placement];
  if (!slot) return null;

  const url = new URL(slot.src);
  if (url.searchParams.has("locale") && slot.locales?.includes(locale)) {
    url.searchParams.set("locale", locale);
  }

  return {
    src: url.toString(),
    label: ads.label ? resolveLocalizedString(ads.label, locale) : defaultLabel,
    minHeight: slot.minHeight ?? 0,
  };
}

export function isSupabaseAuthEnabled(): boolean {
  return userConfig.comments.provider === "supabase" && Boolean(userConfig.supabase);
}

export interface ResolvedNavLink {
  type: "link";
  href: string;
  label: string;
  icon?: string;
  external?: boolean;
}

export interface ResolvedNavDropdown {
  type: "dropdown";
  label: string;
  href?: string;
  items: Omit<ResolvedNavLink, "type">[];
}

export type ResolvedNavItem = ResolvedNavLink | ResolvedNavDropdown;

/** Navbar items with labels resolved for a locale. */
export function getNavLinks(locale: string): ResolvedNavItem[] {
  return userConfig.themeConfig.navbar.links.map((item): ResolvedNavItem => {
    if (isNavDropdown(item)) {
      return {
        type: "dropdown",
        label: resolveLocalizedString(item.label, locale),
        href: item.href,
        items: item.items.map((link) => ({
          href: link.href,
          label: resolveLocalizedString(link.label, locale),
          icon: link.icon,
          external: link.external,
        })),
      };
    }
    return {
      type: "link",
      href: item.href,
      label: resolveLocalizedString(item.label, locale),
      icon: item.icon,
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
      icon: item.icon,
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

  const url = absoluteUrl(path);
  const seoConfig = config.seo;

  const metadata: Metadata = {
    // Page titles go through the root layout template; the site title alone must not be templated.
    title: title ?? { absolute: config.title },
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
    url: absoluteUrl(`/blog/${post.slug}`),
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
    url: absoluteUrl(`/docs/${doc.slug.join("/")}`),
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
