import fs from "fs";
import path from "path";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { RouteProgress } from "@/components/route-progress";
import { Analytics } from "@/components/analytics";
import { getConfig, seo } from "@/lib/config";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const config = getConfig();

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  ...seo({
    title: config.title,
    description: config.seo.defaultDescription,
    path: "/",
  }),
  icons: {
    icon: "/icon.svg",
  },
};

const feedLinks = [
  { rel: "alternate", type: "application/rss+xml", title: `${config.title} RSS`, href: `${config.url}/rss.xml` },
  { rel: "alternate", type: "application/atom+xml", title: `${config.title} Atom`, href: `${config.url}/atom.xml` },
  { rel: "alternate", type: "application/feed+json", title: `${config.title} JSON Feed`, href: `${config.url}/feed.json` },
];

const customCssInline = (config.customCss ?? []).map((cssPath) => {
  const filePath = path.join(process.cwd(), cssPath);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}).filter(Boolean);

const customScripts = (config.customScripts ?? []).map((script, i) => {
  const strategy = script.strategy ?? "afterInteractive";

  // External URL
  if (script.external && script.src) {
    return { id: `custom-script-${i}`, src: script.src, strategy, position: script.position ?? "body" };
  }

  // Local file
  if (script.src && !script.external) {
    return { id: `custom-script-${i}`, src: `/api/custom-script/${script.src}`, strategy, position: script.position ?? "body" };
  }

  // Inline code
  return { id: `custom-script-${i}`, code: script.code ?? "", strategy, position: script.position ?? "body" };
});

const headScripts = customScripts.filter((s) => s.position === "head");
const bodyScripts = customScripts.filter((s) => s.position === "body");

function renderScript(s: typeof customScripts[number]) {
  if ("code" in s && s.code) {
    return (
      <Script key={s.id} id={s.id} strategy={s.strategy as "beforeInteractive" | "afterInteractive" | "lazyOnload"}>
        {s.code}
      </Script>
    );
  }
  return (
    <Script key={s.id} id={s.id} src={s.src} strategy={s.strategy as "beforeInteractive" | "afterInteractive" | "lazyOnload"} />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {config.monetag?.tagSrc && config.monetag?.tagZoneId && (
          <script
            src={config.monetag.tagSrc}
            data-zone={config.monetag.tagZoneId}
            async
            data-cfasync="false"
          />
        )}
        {feedLinks.map((link) => (
          <link key={link.type} rel={link.rel} type={link.type} title={link.title} href={link.href} />
        ))}
        {customCssInline.map((css, i) => (
          <style key={`custom-css-${i}`} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
        {headScripts.map(renderScript)}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={config.themeConfig.colorMode.defaultMode}
          enableSystem={config.themeConfig.colorMode.respectPrefersColorScheme}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
          >
            {locale === "ru" ? "Перейти к содержимому" : "Skip to content"}
          </a>
          <RouteProgress />
          <div className="flex min-h-screen flex-col">
            <Header dict={dict} locale={locale} />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer dict={dict} locale={locale} />
          </div>
          <ScrollToTop />
        </ThemeProvider>
        {bodyScripts.map(renderScript)}
        <Analytics />
      </body>
    </html>
  );
}
