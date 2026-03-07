import type { CloudeaConfig } from "./src/lib/config";

const config: CloudeaConfig = {
  title: "Cloudea Blog",
  tagline: "Платформа для блогов и документации",
  url: "http://localhost:3000",
  favicon: "/favicon.ico",

  // Главная страница:
  // "landing" — стандартная лендинг-страница (по умолчанию)
  // "blog"    — редирект на блог
  // "docs"    — редирект на документацию
  // "about"   — кастомная страница из content/pages/about.mdx
  homepage: "landing",

  // Кастомные CSS-файлы (пути от корня проекта)
  // customCss: ["styles/custom.css"],

  // Кастомные скрипты
  // customScripts: [
  //   { src: "scripts/analytics.js" },
  //   { src: "https://example.com/analytics.js", external: true, position: "head" },
  //   { code: "console.log('Hello from Cloudea!')", strategy: "lazyOnload" },
  // ],

  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en"],
  },

  seo: {
    // Дефолтные мета-теги для всех страниц
    titleTemplate: "%s | Cloudea Blog",
    defaultDescription: "Платформа для блогов и документации на базе Next.js",
    keywords: ["blog", "documentation", "nextjs", "mdx", "react"],

    openGraph: {
      type: "website",
      siteName: "Cloudea Blog",
      locale: "ru_RU",
      // images задаются автоматически через opengraph-image.tsx
    },

    twitter: {
      card: "summary_large_image",
      // site: "@yourhandle",    // Twitter/X аккаунт сайта
      // creator: "@yourhandle", // Twitter/X аккаунт автора
    },

    // Верификация поисковых систем
    verification: {
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
    },

    // JSON-LD structured data
    structuredData: {
      // Организация / автор для schema.org
      organization: {
        name: "Cloudea",
        url: "http://localhost:3000",
        logo: "http://localhost:3000/logo.png",
      },
    },

    // Генерация sitemap и robots.txt
    robots: {
      index: true,
      follow: true,
    },
  },

  themeConfig: {
    colorMode: {
      defaultMode: "system",
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: "Cloudea",
      links: [
        { href: "/blog", label: { ru: "Блог", en: "Blog" } },
        { href: "/docs", label: { ru: "Документация", en: "Docs" } },
        { href: "/about", label: { ru: "О проекте", en: "About" } },
      ],
    },

    footer: {
      copyright: "Cloudea",
      links: [
        {
          title: { ru: "Ресурсы", en: "Resources" },
          items: [
            { label: { ru: "Блог", en: "Blog" }, href: "/blog" },
            { label: { ru: "Документация", en: "Docs" }, href: "/docs" },
          ],
        },
        {
          title: { ru: "Сообщество", en: "Community" },
          items: [
            { label: "GitHub", href: "https://github.com/BazZziliuS/cloudea-blog", external: true },
          ],
        },
      ],
    },

    socials: {
      github: "https://github.com/BazZziliuS/cloudea-blog",
    },
  },

  supabase: {
    url: "https://fonsmwqmefbgersyvngi.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbnNtd3FtZWZiZ2Vyc3l2bmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODY0NzgsImV4cCI6MjA4ODQ2MjQ3OH0.adoDNzfCZ3MwzT9PfMeyJ4Qtp7XHX2NweVmHUElvMBE",
  },

  comments: {
    // "supabase" — комментарии через авторизацию Supabase (GitHub OAuth)
    // "giscus"   — комментарии через GitHub Discussions
    // "none"     — без комментариев
    provider: "giscus",

    giscus: {
      repo: "BazZziliuS/cloudea-blog",
      repoId: "R_kgDORg3eHw",
      category: "comments",
      categoryId: "DIC_kwDORg3eH84C3413",
      mapping: "pathname",
    },
  },
};

export default config;
