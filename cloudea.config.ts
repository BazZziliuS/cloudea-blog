import type { CloudeaConfig } from "./src/lib/config";

/** Travelpayouts: форма поиска авиабилетов и отелей Aviasales. */
const TRAVELPAYOUTS_SEARCH_FORM =
  "https://tpwdg.com/content?currency=rub&trs=548992&shmarker=749500&show_hotels=true&powered_by=true&locale=ru&searchUrl=www.aviasales.ru%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&plain=false&promo_id=7879&campaign_id=100";

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
  // Travelpayouts-загрузчик монетизации ссылок (https://emrldtp.cc/NTQ4OTky.js?t=548992)
  // отключён: после снятия блокировки CSP он подвешивал вкладку браузера при загрузке
  // страницы. Рекламные блоки из секции ads работают без него.
  customScripts: [],

  // Раздел «Проекты»: портфолио и продукты из content/projects.
  projects: {
    // Куда писать насчёт заказа: кнопка на странице каждого проекта.
    contact: {
      href: "https://discord.com/users/347880706724069376",
      label: { ru: "Заказать похожий", en: "Order something similar" },
    },
  },

  // Рекламные блоки внутри страниц.
  // src — URL скрипта виджета из Travelpayouts (Инструменты → Виджеты).
  // Виджет рисуется в контейнере с подписью «Реклама» и грузится, только когда
  // читатель доскроллил до него. Убрать блок — удалить его строку из slots.
  ads: {
    label: { ru: "Реклама", en: "Advertisement", zh: "广告" },
    slots: {
      // Под текстом статьи
      "post-bottom": { src: TRAVELPAYOUTS_SEARCH_FORM, locales: ["ru", "en"], minHeight: 120 },
      // Под текстом страницы вики
      "doc-bottom": { src: TRAVELPAYOUTS_SEARCH_FORM, locales: ["ru", "en"], minHeight: 120 },
      // Под списком статей в блоге:
      // "blog-list": { src: TRAVELPAYOUTS_SEARCH_FORM, locales: ["ru", "en"], minHeight: 120 },
      // Внутри MDX: <Ad />
      // inline: { src: "...", minHeight: 120 },
    },
  },

  // Дополнительные источники для Content-Security-Policy.
  // Домены аналитики, giscus, Supabase и внешних скриптов из customScripts
  // добавляются автоматически — здесь только то, что скрипты подгружают сами.
  csp: {
    // Travelpayouts: виджеты из ads грузятся с tpwdg.com и ходят в API и CDN на множестве доменов.
    scriptSrc: ["https://tpwdg.com", "https://*.tpwdg.com"],
    connectSrc: ["https:"],
    frameSrc: ["https:"],
  },

  // Аналитика
  analytics: {
    yandexMetrika: "101940986",
  },

  // Monetag — рекламная сеть (https://monetag.com)
  // Все значения берутся из личного кабинета Monetag.
  // Раскомментируйте секцию, чтобы включить интеграцию.
  // monetag: {
  //   tagSrc: "https://nap5k.com/tag.min.js",
  //   tagZoneId: "10848690",
  //   swDomain: "3nbf4.com",
  //   swZoneId: 10847807,
  // },

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
          label: { ru: "Проекты", en: "Projects", zh: "项目" },
          href: "/projects",
          items: [
            { href: "/projects?kind=client", label: { ru: "Заказы", en: "Client work" }, icon: "bot" },
            { href: "/projects?kind=product", label: { ru: "Продукты", en: "Products" }, icon: "package" },
            { href: "/projects?kind=open-source", label: "Open source", icon: "code" },
            { href: "/projects?kind=mod", label: { ru: "Моды Minecraft", en: "Minecraft mods" }, icon: "blocks" },
          ],
        },
        {
          label: { ru: "Вики", en: "Wiki" },
          href: "/docs",
          items: [
            { href: "/docs/garrysmod", label: "Garry's Mod", icon: "gamepad-2" },
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
          title: { ru: "Проекты", en: "Projects" },
          items: [
            { label: { ru: "Заказы", en: "Client work" }, href: "/projects?kind=client", icon: "bot" },
            { label: { ru: "Продукты", en: "Products" }, href: "/projects?kind=product", icon: "package" },
            { label: { ru: "Моды Minecraft", en: "Minecraft mods" }, href: "/projects?kind=mod", icon: "blocks" },
          ],
        },
        {
          title: { ru: "Вики", en: "Wiki" },
          items: [
            { label: "Garry's Mod", href: "/docs/garrysmod", icon: "gamepad-2" },
            { label: "Windows", href: "/docs/windows", icon: "monitor" },
            { label: { ru: "О платформе", en: "Platform docs" }, href: "/docs/project", icon: "book-open" },
          ],
        },
        {
          title: { ru: "Автор", en: "Author" },
          items: [
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
