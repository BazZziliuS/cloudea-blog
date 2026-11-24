import fs from "node:fs";
import path from "node:path";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RouteProgress } from "@/components/route-progress";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import {
  absoluteUrl,
  getConfig,
  getDonateLink,
  getNavLinks,
  isSupabaseAuthEnabled,
  seo,
  type CloudeaConfig,
} from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const config = getConfig();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const baseMetadata = seo({ path: "/" });

export const metadata: Metadata = {
  ...baseMetadata,
  title: {
    default: config.title,
    template: config.seo.titleTemplate,
  },
  icons: { icon: "/icon.svg" },
  alternates: {
    ...baseMetadata.alternates,
    types: {
      "application/rss+xml": [{ url: absoluteUrl("/rss.xml"), title: `${config.title} RSS` }],
      "application/atom+xml": [{ url: absoluteUrl("/atom.xml"), title: `${config.title} Atom` }],
      "application/feed+json": [{ url: absoluteUrl("/feed.json"), title: `${config.title} JSON Feed` }],
    },
  },
};

/** Custom CSS from `customCss` is inlined at build time. */
const customCss = (config.customCss ?? [])
  .map((cssPath) => {
    try {
      return fs.readFileSync(path.join(/* turbopackIgnore: true */ process.cwd(), cssPath), "utf-8");
    } catch {
      console.warn(`[cloudea] customCss file not found: ${cssPath}`);
      return "";
    }
  })
  .filter(Boolean);

type ScriptStrategy = NonNullable<NonNullable<CloudeaConfig["customScripts"]>[number]["strategy"]>;

interface CustomScript {
  id: string;
  strategy: ScriptStrategy;
  position: "head" | "body";
  src?: string;
  code?: string;
}

const customScripts: CustomScript[] = (config.customScripts ?? []).map((script, index) => ({
  id: `custom-script-${index}`,
  strategy: script.strategy ?? "afterInteractive",
  position: script.position ?? "body",
  ...(script.src
    ? { src: script.external ? script.src : `/api/custom-script/${script.src.replace(/^\.?\//, "")}` }
    : { code: script.code ?? "" }),
}));

function renderScript({ id, strategy, src, code }: CustomScript) {
  return src ? (
    <Script key={id} id={id} src={src} strategy={strategy} />
  ) : (
    <Script key={id} id={id} strategy={strategy}>
      {code}
    </Script>
  );
}

/** Monetag tag loader: injects the tag script with the configured zone. */
function MonetagTag({ tagSrc, tagZoneId }: { tagSrc: string; tagZoneId: string }) {
  const loader = `(function(s){s.dataset.zone=${JSON.stringify(tagZoneId)},s.src=${JSON.stringify(
    tagSrc,
  )}})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
  return <script dangerouslySetInnerHTML={{ __html: loader }} />;
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { themeConfig, monetag } = config;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {monetag?.tagSrc && monetag.tagZoneId && <MonetagTag tagSrc={monetag.tagSrc} tagZoneId={monetag.tagZoneId} />}
        {customCss.map((css, index) => (
          <style key={`custom-css-${index}`} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
        {customScripts.filter((s) => s.position === "head").map(renderScript)}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={themeConfig.colorMode.defaultMode}
          enableSystem={themeConfig.colorMode.respectPrefersColorScheme}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
          >
            {dict.common.skipToContent}
          </a>
          <RouteProgress />
          <div className="flex min-h-screen flex-col">
            <Header
              title={themeConfig.navbar.title}
              navItems={getNavLinks(locale)}
              donateLink={getDonateLink(locale)}
              githubUrl={themeConfig.socials?.github}
              authEnabled={isSupabaseAuthEnabled()}
              dict={dict}
              locale={locale}
            />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer dict={dict} locale={locale} />
          </div>
          <ScrollToTop label={dict.common.scrollToTop} />
        </ThemeProvider>
        {customScripts.filter((s) => s.position === "body").map(renderScript)}
        <Analytics />
      </body>
    </html>
  );
}
