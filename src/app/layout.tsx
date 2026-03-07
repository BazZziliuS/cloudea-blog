import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { getConfig, seo } from "@/lib/config";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const config = getConfig();

export const metadata = seo({
  title: config.title,
  description: config.seo.defaultDescription,
  path: "/",
});

const feedLinks = [
  { rel: "alternate", type: "application/rss+xml", title: `${config.title} RSS`, href: `${config.url}/rss.xml` },
  { rel: "alternate", type: "application/atom+xml", title: `${config.title} Atom`, href: `${config.url}/atom.xml` },
  { rel: "alternate", type: "application/feed+json", title: `${config.title} JSON Feed`, href: `${config.url}/feed.json` },
];

const customCssLinks = (config.customCss ?? []).map((cssPath) => `/api/custom-css/${cssPath}`);

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
        {feedLinks.map((link) => (
          <link key={link.type} rel={link.rel} type={link.type} title={link.title} href={link.href} />
        ))}
        {customCssLinks.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {headScripts.map(renderScript)}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={config.themeConfig.colorMode.defaultMode}
          enableSystem={config.themeConfig.colorMode.respectPrefersColorScheme}
        >
          <div className="flex min-h-screen flex-col">
            <Header dict={dict} locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer dict={dict} locale={locale} />
          </div>
          <ScrollToTop />
        </ThemeProvider>
        {bodyScripts.map(renderScript)}
      </body>
    </html>
  );
}
