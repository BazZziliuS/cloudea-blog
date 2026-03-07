export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

const dictionaries = {
  ru: {
    nav: {
      blog: "Блог",
      docs: "Документация",
      search: "Поиск...",
      signIn: "Войти",
      signOut: "Выйти",
    },
    home: {
      subtitle: "Платформа для блогов и документации",
      readBlog: "Читать блог",
      documentation: "Документация",
      features: "Возможности",
      featuresSubtitle: "Всё что нужно для создания современной документации и блога",
      mdxTitle: "MDX Support",
      mdxDesc: "Пишите контент в MDX с поддержкой React-компонентов прямо в Markdown-документах.",
      darkTitle: "Dark Mode",
      darkDesc: "Встроенная поддержка светлой и тёмной темы с автоматическим определением системных настроек.",
      authTitle: "GitHub Auth",
      authDesc: "Аутентификация через GitHub для управления контентом и взаимодействия с платформой.",
    },
    blog: {
      title: "Блог",
      subtitle: "Статьи, туториалы и анонсы",
      noPosts: "Постов пока нет.",
      tags: "Теги",
      allTags: "Все теги блога",
      archive: "Архив",
      archiveSubtitle: "Все посты блога по годам",
      allTagsLink: "Все",
      post: "пост",
      posts2_4: "поста",
      posts5: "постов",
      noTags: "Тегов пока нет.",
      backToTags: "Все теги",
      searchPlaceholder: "Поиск по блогу и документации...",
      noResults: "Ничего не найдено",
      minChars: "Введите минимум 2 символа",
      searching: "Поиск...",
      navigation: "навигация",
      open: "открыть",
      close: "закрыть",
      onThisPage: "На этой странице",
      blogLabel: "Блог",
      docsLabel: "Доки",
    },
    auth: {
      title: "Вход в аккаунт",
      subtitle: "Войдите через GitHub для доступа к платформе",
      signInGithub: "Войти через GitHub",
    },
    footer: {
      rights: "Все права защищены.",
      builtWith: "Сделано на",
    },
  },
  en: {
    nav: {
      blog: "Blog",
      docs: "Docs",
      search: "Search...",
      signIn: "Sign in",
      signOut: "Sign out",
    },
    home: {
      subtitle: "Platform for blogs and documentation",
      readBlog: "Read blog",
      documentation: "Documentation",
      features: "Features",
      featuresSubtitle: "Everything you need to create modern documentation and blog",
      mdxTitle: "MDX Support",
      mdxDesc: "Write content in MDX with React components right inside Markdown documents.",
      darkTitle: "Dark Mode",
      darkDesc: "Built-in light and dark theme support with automatic system preference detection.",
      authTitle: "GitHub Auth",
      authDesc: "GitHub authentication for content management and platform interaction.",
    },
    blog: {
      title: "Blog",
      subtitle: "Articles, tutorials, and announcements",
      noPosts: "No posts yet.",
      tags: "Tags",
      allTags: "All blog tags",
      archive: "Archive",
      archiveSubtitle: "All blog posts by year",
      allTagsLink: "All",
      post: "post",
      posts2_4: "posts",
      posts5: "posts",
      noTags: "No tags yet.",
      backToTags: "All tags",
      searchPlaceholder: "Search blog and docs...",
      noResults: "Nothing found",
      minChars: "Enter at least 2 characters",
      searching: "Searching...",
      navigation: "navigate",
      open: "open",
      close: "close",
      onThisPage: "On this page",
      blogLabel: "Blog",
      docsLabel: "Docs",
    },
    auth: {
      title: "Sign in",
      subtitle: "Sign in with GitHub to access the platform",
      signInGithub: "Sign in with GitHub",
    },
    footer: {
      rights: "All rights reserved.",
      builtWith: "Built with",
    },
  },
};

export type Dictionary = (typeof dictionaries)["ru"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
