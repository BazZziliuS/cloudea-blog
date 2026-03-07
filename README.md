# Cloudea Blog

Платформа для блогов и документации, вдохновлённая Docusaurus. Построена на Next.js 16, Tailwind CSS v4 и shadcn/ui.

## Возможности

- **Блог** — MDX-посты с подсветкой кода (Shiki), тегами, архивом по годам, временем чтения
- **Вложенные папки** — посты в `content/blog/2025/my-post/index.mdx` с картинками рядом
- **Черновики** — `draft: true` в frontmatter скрывает пост из всех списков и фидов
- **Документация** — многоуровневая структура с sidebar, TOC и breadcrumbs
- **Кастомные страницы** — MDX-страницы из `content/pages/` (About, Projects и т.д.)
- **Конфигурация** — один файл `cloudea.config.ts` в стиле Docusaurus
- **Тёмная тема** — light/dark/system через next-themes
- **i18n** — русский и английский язык (cookie-based)
- **Поиск** — глобальный поиск Ctrl+K по блогу и документации
- **Комментарии** — Giscus (GitHub Discussions) или Supabase
- **Авторизация** — GitHub OAuth через Supabase
- **SEO** — авто-метатеги, sitemap.xml, robots.txt, JSON-LD, OG-изображения
- **Фиды** — RSS, Atom, JSON Feed
- **Гео-блокировка** — блокировка постов по странам через frontmatter
- **Связанные посты** — рекомендации по тегам внизу статьи
- **Редактирование** — ссылка «Редактировать на GitHub» в постах и документации
- **Кнопка Copy** — копирование код-блоков одним кликом
- **Кнопка «Наверх»** — плавающая кнопка прокрутки
- **Кастомная 404** — страница «Не найдено»
- **Custom CSS/JS** — подключение своих стилей и скриптов через конфиг
- **Semantic Release** — автоматическое версионирование и CHANGELOG

## Стек

| Технология | Назначение |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, RSC, Turbopack |
| [Tailwind CSS v4](https://tailwindcss.com) | Стили |
| [shadcn/ui](https://ui.shadcn.com) | UI-компоненты |
| [Supabase](https://supabase.com) | Авторизация, комментарии |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | Рендеринг MDX |
| [Shiki](https://shiki.style) | Подсветка кода |
| [Giscus](https://giscus.app) | Комментарии через GitHub Discussions |
| [semantic-release](https://semantic-release.gitbook.io) | Автоматические релизы |

## Быстрый старт

```bash
# Клонирование
git clone https://github.com/BazZziliuS/cloudea-blog.git
cd cloudea-blog

# Установка зависимостей
npm install

# Запуск dev-сервера
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
  // customCss: ["styles/custom.css"],
  // customScripts: [{ src: "scripts/analytics.js" }],

  supabase: {
    url: "https://xxx.supabase.co",
    anonKey: "your-anon-key",
  },

  comments: {
    provider: "giscus",    // "giscus" | "supabase" | "none"
    giscus: { repo: "...", repoId: "...", category: "...", categoryId: "...", mapping: "pathname" },
  },
  // ... seo, themeConfig, i18n
};
```

## Настройка GitHub OAuth

1. Создайте проект в [Supabase](https://supabase.com)
2. В Dashboard: **Authentication > Providers > GitHub**
3. Создайте OAuth App в [GitHub Developer Settings](https://github.com/settings/developers):
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://<project>.supabase.co/auth/v1/callback`
4. Скопируйте Client ID и Client Secret в Supabase
5. Укажите `url` и `anonKey` в `cloudea.config.ts` → `supabase`

## Структура проекта

```
cloudea.config.ts                  # Конфигурация платформы
content/
  blog/                            # Блог-посты
    2026/hello-world.mdx           # Обычный пост
    2025/05-17-n8n/                # Пост-директория
      index.mdx                    # Контент поста
      screenshot.png               # Ассеты рядом с постом
  docs/                            # Документация
    getting-started/
      introduction.mdx
      installation.mdx
    guides/
      writing-content.mdx
  pages/                           # Кастомные страницы
    about.mdx                      # → /about
src/
  app/
    page.tsx                       # Главная (или redirect)
    layout.tsx                     # Корневой layout
    not-found.tsx                  # Кастомная 404
    blog/[...slug]/page.tsx        # Страница поста
    docs/[...slug]/page.tsx        # Страница документа
    [...page]/page.tsx             # Кастомные страницы
    rss.xml/route.ts               # RSS фид
    atom.xml/route.ts              # Atom фид
    feed.json/route.ts             # JSON Feed
  components/
    ui/                            # shadcn/ui
    header.tsx, footer.tsx         # Шапка, подвал
    sidebar.tsx, toc.tsx           # Навигация docs
    breadcrumbs.tsx                # Хлебные крошки
    search.tsx                     # Ctrl+K поиск
    post-grid.tsx, post-card.tsx   # Карточки постов
    geo-guard.tsx                  # Гео-блокировка
    scroll-to-top.tsx              # Кнопка «Наверх»
  lib/
    config.ts                      # Загрузка конфига, SEO утилиты
    content.ts                     # Загрузка контента
    mdx.ts                         # Компиляция MDX
    feed.ts                        # Генерация фидов
    i18n.ts, i18n-server.ts        # Интернационализация
    supabase/                      # Supabase клиенты
styles/
  custom.css                       # Пример кастомных стилей
```

## Добавление контента

### Блог-пост (файл)

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

### Блог-пост (директория с ассетами)

```
content/blog/2025/my-post/
  index.mdx        # контент, ссылается на ./image.png
  image.png         # картинка рядом
```

### Гео-блокировка поста

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

Содержимое...
```

### Кастомная страница

Файл `content/pages/about.mdx` → доступна по `/about`. Добавьте в навбар через конфиг.

## Semantic Release

Проект использует [semantic-release](https://semantic-release.gitbook.io) для автоматического версионирования и генерации CHANGELOG.

### Как это работает

При пуше в `main` GitHub Actions автоматически:
1. Анализирует коммиты по [Conventional Commits](https://www.conventionalcommits.org)
2. Определяет тип релиза (patch/minor/major)
3. Обновляет `CHANGELOG.md` и `package.json`
4. Создаёт GitHub Release с release notes

### Формат коммитов

| Префикс | Тип релиза | Пример |
|---|---|---|
| `fix:` | Patch (1.0.x) | `fix: исправить прокрутку якорей` |
| `feat:` | Minor (1.x.0) | `feat: добавить RSS фид` |
| `feat!:` или `BREAKING CHANGE:` | Major (x.0.0) | `feat!: переделать конфиг` |
| `chore:`, `docs:`, `style:` | Нет релиза | `docs: обновить README` |

### Локальный запуск (dry run)

```bash
GITHUB_TOKEN=your_token npx semantic-release --dry-run
```

### Настройка

Конфигурация в `.releaserc.json`. Плагины:
- **commit-analyzer** — анализ коммитов
- **release-notes-generator** — генерация заметок
- **changelog** — обновление CHANGELOG.md
- **npm** — обновление version в package.json (без публикации)
- **git** — коммит изменённых файлов
- **github** — создание GitHub Release

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
