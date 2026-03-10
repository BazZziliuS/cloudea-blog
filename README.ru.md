# Cloudea Blog

Платформа для блогов и документации, вдохновлённая Docusaurus. Построена на Next.js 16, Tailwind CSS v4 и shadcn/ui.

> **[English version (README.md)](./README.md)**

## Возможности

- **Блог** — посты в MDX и Markdown с подсветкой кода (Shiki), тегами, архивом по годам, временем чтения
- **Вложенные папки** — посты в `content/blog/2025/my-post/index.mdx` с картинками рядом
- **Черновики** — `draft: true` в frontmatter скрывает пост из всех списков и фидов
- **Документация** — многоуровневая структура с sidebar, подкатегориями, TOC, breadcrumbs и датой обновления
- **Кастомные страницы** — MDX-страницы из `content/pages/` (About, Projects и т.д.)
- **Конфигурация** — один файл `cloudea.config.ts` в стиле Docusaurus
- **Тёмная тема** — light/dark/system через next-themes с кастомной цветовой схемой
- **i18n** — мультиязычные посты (`slug.en.mdx` рядом с `slug.mdx`)
- **Поиск** — глобальный поиск Ctrl+K по блогу и документации
- **Комментарии** — Giscus (GitHub Discussions) или Supabase
- **Авторизация** — GitHub OAuth через Supabase (кнопка скрывается если провайдер не Supabase)
- **SEO** — авто-метатеги, sitemap.xml, robots.txt, JSON-LD, OG-изображения
- **Фиды** — RSS, Atom, JSON Feed
- **Аналитика** — Google Analytics (gtag) и Яндекс.Метрика через конфиг
- **Гео-блокировка** — блокировка постов по странам через frontmatter или скрытие секций компонентом `<GeoHide>`
- **Кнопки «Поделиться»** — Twitter/X, Telegram, копирование ссылки
- **Связанные посты** — рекомендации по тегам внизу статьи
- **Кнопка Copy** — копирование код-блоков одним кликом
- **Error boundaries** — обработка ошибок по секциям (блог, документация)
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Скелетоны загрузки** — анимированные placeholder'ы при навигации
- **Custom CSS/JS** — подключение своих стилей и скриптов через конфиг
- **Semantic Release** — автоматическое версионирование и CHANGELOG

## Стек

| Технология | Назначение |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, RSC, Turbopack |
| [Tailwind CSS v4](https://tailwindcss.com) | Стили |
| [shadcn/ui](https://ui.shadcn.com) | UI-компоненты |
| [Supabase](https://supabase.com) | Авторизация, комментарии |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | Рендеринг MDX/Markdown |
| [Shiki](https://shiki.style) | Подсветка кода |
| [Giscus](https://giscus.app) | Комментарии через GitHub Discussions |
| [semantic-release](https://semantic-release.gitbook.io) | Автоматические релизы |

## Быстрый старт

```bash
git clone https://github.com/BazZziliuS/cloudea-blog.git
cd cloudea-blog
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Конфигурация

Вся настройка — в файле `cloudea.config.ts`:

```ts
const config: CloudeaConfig = {
  title: "My Blog",
  url: "https://example.com",
  homepage: "landing",     // "landing" | "blog" | "docs" | "about"
  customCss: ["styles/custom.css"],
  // customScripts: [{ src: "scripts/analytics.js" }],

  analytics: {
    yandexMetrika: "101940986",   // Яндекс.Метрика
    // gtag: "G-XXXXXXXXXX",      // Google Analytics
  },

  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en"],
  },

  comments: {
    provider: "giscus",    // "giscus" | "supabase" | "none"
    giscus: { repo: "...", repoId: "...", category: "...", categoryId: "...", mapping: "pathname" },
  },
};
```

## Темизация

Переопределите CSS-переменные в `styles/custom.css`:

```css
:root {
  --primary: oklch(0.55 0.13 230);           /* cyan */
  --primary-foreground: oklch(1 0 0);
}

.dark {
  --background: oklch(0.07 0.025 265);       /* deep navy */
  --primary: oklch(0.65 0.14 230);           /* lighter cyan */
}
```

Кастомный CSS инлайнится через `<style>` в `<head>`, гарантируя переопределение базовой темы.

## Структура проекта

```
cloudea.config.ts                  # Конфигурация платформы
styles/
  custom.css                       # Кастомная тема (CSS-переменные)
content/
  blog/                            # Блог-посты (.mdx или .md)
    2026/hello-world.mdx           # Файл-пост
    2026/hello-world.en.mdx        # Перевод поста
    2025/05-17-n8n/                # Пост-директория
      index.mdx                    # Контент поста
      screenshot.png               # Ассеты рядом с постом
  docs/                            # Документация
    getting-started/
      index.mdx                    # Индекс категории
      introduction.mdx
      installation.mdx
    bots/
      index.mdx                    # Индекс категории
      orders/                      # Подкатегория
        index.mdx                  # Индекс подкатегории
        project-a.mdx
      personal/
        index.mdx
        project-b.mdx
  pages/                           # Кастомные страницы
    about.mdx                      # → /about
src/
  app/                             # Next.js App Router
    layout.tsx                     # Корневой layout
    error.tsx                      # Error boundary
    not-found.tsx                  # Кастомная 404
    blog/[...slug]/page.tsx        # Страница поста
    docs/[...slug]/page.tsx        # Страница документа
  components/                      # React-компоненты
  lib/                             # Утилиты (content, config, i18n)
```

## Добавление контента

### Блог-пост

```mdx
---
title: "Заголовок"
description: "Описание"
date: "2026-03-07"
tags: ["tag1", "tag2"]
draft: false
---

Содержимое...
```

Поддерживаются форматы `.mdx` (с JSX-компонентами) и `.md` (чистый Markdown).

### Мультиязычные посты

- `hello-world.mdx` — основной язык
- `hello-world.en.mdx` — английская версия

Для директория-постов: `index.mdx` + `index.en.mdx`.

### Гео-блокировка

```yaml
geo_block:
  countries: ["RU", "DE"]
  message: "Контент недоступен в вашем регионе."
```

### Документация

```mdx
---
title: "Заголовок"
description: "Описание"
order: 1
---
```

Категория определяется именем папки. `index.mdx` в папке создаёт индексную страницу категории. Вложенные папки создают подкатегории со сворачиваемыми секциями в sidebar.

### Гео-блокировка секций

Используйте `<GeoHide>` в MDX для скрытия отдельных секций по стране:

```mdx
<GeoHide countries={["RU"]}>

## VPN-инструменты

Контент скрыт для пользователей из России...

</GeoHide>
```

Заблокированный контент отображается с блюром и сообщением.

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск dev-сервера (Turbopack) |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сервера |
| `npm run lint` | Линтинг |
| `npm run release` | Запуск semantic-release |

## Лицензия

MIT
