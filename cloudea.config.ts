import type { CloudeaConfig } from "./src/lib/config";

const config: CloudeaConfig = {
  title: "Cloudea Blog",
  tagline: "Платформа для блогов и документации",
  url: "https://blog.cloudea.org",
  favicon: "/favicon.ico",

  // Главная страница:
  // "landing" — стандартная лендинг-страница (по умолчанию)
  // "blog"    — редирект на блог
  // "docs"    — редирект на документацию
  // "about"   — кастомная страница из content/pages/about.mdx
  homepage: "blog",

  // Кастомные CSS-файлы (пути от корня проекта)
  // customCss: ["styles/custom.css"],

  // Кастомные скрипты
  // customScripts: [
  //   { src: "scripts/analytics.js" },
  //   { src: "https://example.com/analytics.js", external: true, position: "head" },
  //   { code: "console.log('Hello from Cloudea!')", strategy: "lazyOnload" },
  // ],

  // Аналитика
  analytics: {
    yandexMetrika: "101940986",
  },

  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en", "zh"],
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
        url: "https://blog.cloudea.org",
        logo: "https://blog.cloudea.org/logo.png",
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
        {
          label: { ru: "Блог", en: "Blog" },
          href: "/blog",
          items: [
            { href: "/blog", label: { ru: "Статьи", en: "Posts" }, icon: "file-text" },
            { href: "/blog/tags", label: { ru: "Теги", en: "Tags" }, icon: "tags" },
            { href: "/blog/archive", label: { ru: "Архив", en: "Archive" }, icon: "archive" },
          ],
        },
        {
          label: { ru: "Вики", en: "Wiki" },
          href: "/docs",
          items: [
            { href: "/docs/bots", label: { ru: "Боты", en: "Bots" }, icon: "bot" },
            { href: "/docs/minecraft", label: "Minecraft", icon: "blocks" },
            { href: "/docs/garrysmod", label: "Garry's Mod", icon: "gamepad-2" },
            { href: "/docs/javascript", label: "JavaScript", icon: "code" },
            { href: "/docs/windows", label: "Windows", icon: "monitor" },
          ],
        },
      ],
    },

    footer: {
      copyright: "Cloudea",
      links: [
        {
          title: { ru: "Блог", en: "Blog" },
          items: [
            { label: { ru: "Все статьи", en: "All Posts" }, href: "/blog", icon: "file-text" },
            { label: { ru: "Теги", en: "Tags" }, href: "/blog/tags", icon: "tags" },
            { label: { ru: "Архив", en: "Archive" }, href: "/blog/archive", icon: "archive" },
          ],
        },
        {
          title: { ru: "Вики", en: "Wiki" },
          items: [
            { label: { ru: "Боты", en: "Bots" }, href: "/docs/bots", icon: "bot" },
            { label: "Minecraft", href: "/docs/minecraft", icon: "blocks" },
            { label: "Garry's Mod", href: "/docs/garrysmod", icon: "gamepad-2" },
            { label: "JavaScript", href: "/docs/javascript", icon: "code" },
            { label: "Windows", href: "/docs/windows", icon: "monitor" },
          ],
        },
        {
          title: { ru: "Проект", en: "Project" },
          items: [
            { label: { ru: "Документация", en: "Docs" }, href: "/docs/project", icon: "book-open" },
            { label: { ru: "Обо мне", en: "About" }, href: "/about", icon: "user" },
            { label: "GitHub", href: "https://github.com/BazZziliuS/cloudea-blog", icon: "github", external: true },
          ],
        },
      ],
    },

    // Кнопка "Поддержать" в навбаре
    donateLink: {
      href: "https://t.me/tribute/app?startapp=dtnH",
      label: { ru: "Поддержать", en: "Donate" },
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
